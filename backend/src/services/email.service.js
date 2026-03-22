const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const logger = require("../config/logger");

dotenv.config();

/** Escape text for safe use inside HTML email bodies. */
function escapeHtml(str) {
  if (str == null || str === "") return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return escapeHtml(String(amount));
  const symbol = process.env.ORDER_EMAIL_CURRENCY_SYMBOL || "€";
  return `${symbol}${n.toFixed(2)}`;
}

function billingBlockHtml(invoice) {
  const parts = [
    invoice.billing_street,
    [invoice.billing_zip, invoice.billing_city].filter(Boolean).join(" "),
    invoice.billing_country,
  ].filter((p) => p && String(p).trim());

  if (parts.length === 0) return "";

  const lines = parts.map((p) => `<p style="margin:4px 0;">${escapeHtml(String(p))}</p>`).join("");
  return `
    <div style="background:#fff;padding:14px;margin:16px 0;border-radius:8px;border:1px solid #e0e0e0;">
      <h3 style="margin:0 0 8px 0;color:#333;font-size:16px;">Shipping / billing address</h3>
      ${lines}
    </div>`;
}

function itemsTableHtml(items) {
  const rows = (items || [])
    .map((item) => {
      const name = escapeHtml(item.name || `Product #${item.product_id}`);
      const qty = escapeHtml(String(item.quantity));
      const unit = formatMoney(item.unit_price);
      const line = formatMoney(Number(item.unit_price) * Number(item.quantity));
      return `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;">${name}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">${qty}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">${unit}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">${line}</td>
      </tr>`;
    })
    .join("");

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background:#fff;margin:16px 0;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
      <thead>
        <tr style="background:#f0f4f8;">
          <th style="padding:12px;text-align:left;font-size:13px;color:#555;">Product</th>
          <th style="padding:12px;text-align:center;font-size:13px;color:#555;">Qty</th>
          <th style="padding:12px;text-align:right;font-size:13px;color:#555;">Unit</th>
          <th style="padding:12px;text-align:right;font-size:13px;color:#555;">Line total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function emailShell({ preheader, title, heroBg, heroTitle, heroSubtitle, bodyHtml, footerExtra = "" }) {
  const shopName = escapeHtml(process.env.EMAIL_FROM_NAME || "OOPshop");
  const baseUrl = (process.env.FRONTEND_URL || process.env.PUBLIC_APP_URL || "").replace(/\/$/, "");
  const ctaHref = baseUrl || "#";
  const ctaBlock = baseUrl
    ? `<div style="text-align:center;margin:24px 0;">
         <a href="${escapeHtml(ctaHref)}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">Open ${shopName}</a>
       </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]><style type="text/css">table { border-collapse: collapse; }</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#e8ecf1;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#e8ecf1;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:${heroBg};color:#fff;padding:28px 24px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.02em;">${escapeHtml(heroTitle)}</h1>
              ${heroSubtitle ? `<p style="margin:12px 0 0 0;font-size:15px;opacity:0.95;">${escapeHtml(heroSubtitle)}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 32px 24px;font-size:15px;line-height:1.55;color:#333;">
              ${bodyHtml}
              ${ctaBlock}
              ${footerExtra}
            </td>
          </tr>
          <tr>
            <td style="background:#1e293b;color:#94a3b8;padding:20px 24px;text-align:center;font-size:12px;line-height:1.5;">
              <p style="margin:0;">© ${new Date().getFullYear()} ${shopName}. All rights reserved.</p>
              <p style="margin:8px 0 0 0;">This email was sent because of an order on your account.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

class EmailService {
  constructor() {
    this.transporter = null;
    this.fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@oopshop.com";
    this.fromName = process.env.EMAIL_FROM_NAME || "OOPshop";

    if (this.isEmailConfigured()) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
  }

  isEmailConfigured() {
    return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.isEmailConfigured()) {
      logger.warn("Email not configured (set SMTP_* in .env). Skipping send.", { to, subject });
      return { success: false, message: "Email not configured" };
    }

    if (!this.transporter) {
      logger.error("Email transporter not initialized");
      return { success: false, message: "Email transporter not initialized" };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        text: text || this.htmlToText(html),
        html,
      });

      logger.info("Email sent", { to, subject, messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error("Error sending email", { to, subject, error: error.message });
      return { success: false, message: error.message };
    }
  }

  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();
  }

  generateOrderPlacedTemplate(invoice, user, items) {
    const namePart = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
    const greeting = namePart ? `Dear ${escapeHtml(namePart)},` : "Hello,";
    const orderDate = new Date(invoice.created_at).toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    });

    const summary = `
      <p style="margin:0 0 16px 0;">${greeting}</p>
      <p style="margin:0 0 16px 0;">Thank you for your order. Here is a summary that matches what you see in the app or on the website.</p>
      <div style="background:#f8fafc;padding:18px;border-radius:8px;border:1px solid #e2e8f0;">
        <h2 style="margin:0 0 12px 0;font-size:18px;color:#0f172a;">Order details</h2>
        <p style="margin:6px 0;"><strong>Order #</strong> ${escapeHtml(String(invoice.id))}</p>
        <p style="margin:6px 0;"><strong>Placed</strong> ${escapeHtml(orderDate)}</p>
        <p style="margin:6px 0;"><strong>Status</strong> <span style="color:#d97706;font-weight:600;">${escapeHtml(String(invoice.status || "").toUpperCase())}</span></p>
        <p style="margin:6px 0;"><strong>Total</strong> <span style="font-size:18px;font-weight:700;color:#059669;">${formatMoney(invoice.total_amount)}</span></p>
      </div>
      ${billingBlockHtml(invoice)}
      <h3 style="margin:24px 0 8px 0;font-size:17px;color:#0f172a;">Line items</h3>
      ${itemsTableHtml(items)}
      <table role="presentation" width="100%" style="margin-top:8px;"><tr>
        <td style="text-align:right;font-weight:700;font-size:16px;">Total: ${formatMoney(invoice.total_amount)}</td>
      </tr></table>
      <div style="background:#eff6ff;padding:16px;border-radius:8px;border-left:4px solid #3b82f6;margin-top:20px;">
        <p style="margin:0 0 8px 0;font-weight:600;">What happens next</p>
        <ul style="margin:0;padding-left:20px;">
          <li>Complete payment if you haven’t already.</li>
          <li>We’ll email you again when your order ships.</li>
        </ul>
      </div>
      <p style="margin:24px 0 0 0;">Questions? Reply to this email or contact support through the shop.</p>
      <p style="margin:16px 0 0 0;">— ${escapeHtml(process.env.EMAIL_FROM_NAME || "OOPshop")}</p>
    `;

    return emailShell({
      preheader: `Order #${invoice.id} confirmed — ${formatMoney(invoice.total_amount)}`,
      title: `Order #${invoice.id} — OOPshop`,
      heroBg: "#059669",
      heroTitle: "Order received",
      heroSubtitle: `Order #${invoice.id}`,
      bodyHtml: summary,
    });
  }

  generateOrderShippedTemplate(invoice, user, items) {
    const namePart = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
    const greeting = namePart ? `Dear ${escapeHtml(namePart)},` : "Hello,";
    const shippedDate = new Date().toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    });

    const summary = `
      <p style="margin:0 0 16px 0;">${greeting}</p>
      <p style="margin:0 0 16px 0;">Your order is on its way. Below is the same detail you see in your order history.</p>
      <div style="background:#f8fafc;padding:18px;border-radius:8px;border:1px solid #e2e8f0;">
        <h2 style="margin:0 0 12px 0;font-size:18px;color:#0f172a;">Shipment</h2>
        <p style="margin:6px 0;"><strong>Order #</strong> ${escapeHtml(String(invoice.id))}</p>
        <p style="margin:6px 0;"><strong>Shipped</strong> ${escapeHtml(shippedDate)}</p>
        <p style="margin:6px 0;"><strong>Status</strong> <span style="color:#2563eb;font-weight:600;">SHIPPED</span></p>
        <p style="margin:6px 0;"><strong>Order total</strong> <span style="font-size:18px;font-weight:700;color:#059669;">${formatMoney(invoice.total_amount)}</span></p>
      </div>
      ${billingBlockHtml(invoice)}
      <h3 style="margin:24px 0 8px 0;font-size:17px;color:#0f172a;">Items in this shipment</h3>
      ${itemsTableHtml(items)}
      <table role="presentation" width="100%" style="margin-top:8px;"><tr>
        <td style="text-align:right;font-weight:700;font-size:16px;">Total: ${formatMoney(invoice.total_amount)}</td>
      </tr></table>
      <div style="background:#ecfdf5;padding:16px;border-radius:8px;border-left:4px solid #059669;margin-top:20px;">
        <p style="margin:0;font-weight:600;">Delivery</p>
        <p style="margin:8px 0 0 0;">Please have someone available to receive the package. Tracking may be available in your account.</p>
      </div>
      <p style="margin:24px 0 0 0;">Thank you for shopping with us.</p>
      <p style="margin:16px 0 0 0;">— ${escapeHtml(process.env.EMAIL_FROM_NAME || "OOPshop")}</p>
    `;

    return emailShell({
      preheader: `Order #${invoice.id} has shipped`,
      title: `Shipped — Order #${invoice.id}`,
      heroBg: "#2563eb",
      heroTitle: "Your order has shipped",
      heroSubtitle: `Order #${invoice.id}`,
      bodyHtml: summary,
    });
  }

  async sendOrderPlacedEmail(invoice, user, items) {
    if (!user.email) {
      logger.warn("Cannot send order placed email: no email", { invoiceId: invoice.id, userId: user.id });
      return { success: false, message: "User has no email" };
    }

    const subject = `Order #${invoice.id} received — ${process.env.EMAIL_FROM_NAME || "OOPshop"}`;
    const html = this.generateOrderPlacedTemplate(invoice, user, items);
    return this.sendEmail(user.email, subject, html);
  }

  async sendOrderShippedEmail(invoice, user, items) {
    if (!user.email) {
      logger.warn("Cannot send order shipped email: no email", { invoiceId: invoice.id, userId: user.id });
      return { success: false, message: "User has no email" };
    }

    const subject = `Order #${invoice.id} has shipped — ${process.env.EMAIL_FROM_NAME || "OOPshop"}`;
    const html = this.generateOrderShippedTemplate(invoice, user, items);
    return this.sendEmail(user.email, subject, html);
  }
}

module.exports = new EmailService();
