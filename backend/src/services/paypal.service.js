const fetch = require("node-fetch");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");

class PayPalService {
  constructor() {
    // PayPal API endpoints
    this.baseURL = process.env.PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
    
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    // Validate credentials are set
    if (!this.clientId || !this.clientSecret) {
      logger.warn("PayPal credentials not configured. PayPal integration will not work.");
    }
  }

  /**
   * Get PayPal access token
   */
  async getAccessToken() {
    if (!this.clientId || !this.clientSecret) {
      throw new AppError("PayPal credentials are not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your environment variables.", 500);
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
      
      const response = await fetch(`${this.baseURL}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${auth}`,
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error("PayPal auth failed:", error);
        throw new AppError(`PayPal authentication failed: ${error}`, 500);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logger.error("Error getting PayPal access token:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to authenticate with PayPal", 500);
    }
  }

  /**
   * Create PayPal order
   */
  async createOrder(orderData) {
    try {
      const { invoice_id, amount, currency = "EUR", description } = orderData;
      
      if (!invoice_id || !amount) {
        throw new AppError("invoice_id and amount are required", 400);
      }

      const accessToken = await this.getAccessToken();

      const orderPayload = {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: `invoice_${invoice_id}`,
            description: description || `Order #${invoice_id}`,
            amount: {
              currency_code: currency,
              value: amount.toString(),
            },
          },
        ],
        application_context: {
          brand_name: "OOPshop",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/checkout/success`,
          cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/checkout`,
        },
      };

      const response = await fetch(`${this.baseURL}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "PayPal-Request-Id": `invoice_${invoice_id}_${Date.now()}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error("PayPal create order error:", error);
        throw new Error(`PayPal order creation failed: ${error}`);
      }

      const order = await response.json();
      logger.info(`PayPal order created: ${order.id} for invoice ${invoice_id}`);
      
      return order;
    } catch (error) {
      logger.error("Error creating PayPal order:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to create PayPal order", 500);
    }
  }

  /**
   * Capture PayPal payment
   */
  async capturePayment(orderId) {
    try {
      if (!orderId) {
        throw new AppError("orderId is required", 400);
      }

      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.baseURL}/v2/checkout/orders/${orderId}/capture`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        logger.error("PayPal capture error:", error);
        throw new Error(`PayPal capture failed: ${error}`);
      }

      const capture = await response.json();
      logger.info(`PayPal payment captured: ${orderId}`);
      
      return capture;
    } catch (error) {
      logger.error("Error capturing PayPal payment:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to capture PayPal payment", 500);
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId) {
    try {
      if (!orderId) {
        throw new AppError("orderId is required", 400);
      }

      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.baseURL}/v2/checkout/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`PayPal get order failed: ${error}`);
      }

      const order = await response.json();
      return order;
    } catch (error) {
      logger.error("Error getting PayPal order:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to get PayPal order", 500);
    }
  }
}

module.exports = new PayPalService();

