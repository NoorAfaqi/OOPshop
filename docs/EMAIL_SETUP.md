# Email Configuration Guide

This guide explains how to configure email functionality for order notifications in OOPshop.

## Overview

OOPshop sends automated emails for:
- **Order Placed**: Sent when a customer completes checkout
- **Order Shipped**: Sent when an order status is updated to "shipped"

## Email Service Provider Setup

The email service uses **Nodemailer** and supports any SMTP provider. Common providers include:

- Gmail
- SendGrid
- Mailgun
- Amazon SES
- Outlook/Office 365
- Custom SMTP servers

## Environment Variables

Add the following variables to your `.env` file in the `backend/` directory:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Email From Address
EMAIL_FROM=noreply@oopshop.com
EMAIL_FROM_NAME=OOPshop
```

**Important**: The email service automatically loads credentials from the `.env` file using `dotenv`. Make sure your `.env` file is in the `backend/` directory and contains all the required SMTP configuration variables.

### Configuration Details

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` (TLS) or `465` (SSL) |
| `SMTP_SECURE` | Use SSL/TLS | `true` for port 465, `false` for port 587 |
| `SMTP_USER` | SMTP username/email | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password or app password | `your-app-password` |
| `EMAIL_FROM` | Sender email address | `noreply@oopshop.com` |
| `EMAIL_FROM_NAME` | Sender display name | `OOPshop` |

## Provider-Specific Setup

### Gmail

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - Click "App passwords"
   - Generate a password for "Mail"
   - Use this password in `SMTP_PASSWORD`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

### SendGrid

1. Create a SendGrid account
2. Generate an API key
3. Use SMTP credentials:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Mailgun

1. Create a Mailgun account
2. Get SMTP credentials from dashboard:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

### Amazon SES

1. Verify your email/domain in AWS SES
2. Get SMTP credentials:

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

## Testing Email Configuration

### Option 1: Test via Order Placement

1. Configure email settings in `.env`
2. Place a test order through the checkout
3. Check the application logs for email send status
4. Verify email is received

### Option 2: Test via API (if test endpoint exists)

You can create a test script to verify email configuration:

```javascript
const emailService = require('./src/services/email.service');

// Test email
emailService.sendEmail(
  'test@example.com',
  'Test Email',
  '<h1>Test</h1><p>This is a test email.</p>'
).then(result => {
  console.log('Email result:', result);
});
```

## Email Templates

### Order Placed Email

- **Subject**: `Order Confirmation #{invoice_id} - OOPshop`
- **Content**: Order details, items, total amount, next steps

### Order Shipped Email

- **Subject**: `Your Order #{invoice_id} Has Shipped! - OOPshop`
- **Content**: Shipping confirmation, items, tracking information

## Troubleshooting

### Email Not Sending

1. **Check Configuration**:
   - Verify all SMTP variables are set correctly
   - Check for typos in credentials

2. **Check Logs**:
   - Look for email-related errors in application logs
   - Check for "Email not configured" warnings

3. **Test SMTP Connection**:
   - Use a tool like `telnet` or `openssl` to test SMTP connection
   - Verify firewall/network allows SMTP connections

4. **Provider-Specific Issues**:
   - **Gmail**: Ensure app password is used (not regular password)
   - **SendGrid**: Verify API key has mail send permissions
   - **Mailgun**: Check domain verification status

### Common Errors

**"Email not configured"**
- Missing required SMTP environment variables
- Email service will log warnings but continue operation

**"Authentication failed"**
- Incorrect SMTP credentials
- Check username/password

**"Connection timeout"**
- SMTP host/port incorrect
- Firewall blocking connection
- Network issues

## Disabling Email (Development)

If you don't want to configure email in development:

1. **Don't set SMTP variables** - Email service will skip sending
2. **Check logs** - You'll see "Email not configured" warnings
3. **Application continues** - Order processing works normally

## Production Considerations

1. **Use Dedicated Email Service**: Consider SendGrid, Mailgun, or AWS SES for production
2. **Rate Limiting**: Be aware of provider rate limits
3. **Email Deliverability**: Use verified domains for better deliverability
4. **Error Handling**: Monitor email send failures and implement retry logic if needed
5. **Email Queue**: For high volume, consider using a job queue (Bull, BullMQ) for email sending

## Security Notes

- **Never commit** `.env` file with real credentials
- **Use app passwords** instead of main account passwords
- **Rotate credentials** regularly
- **Use environment-specific** email addresses for testing

---

**Last Updated**: January 2026
