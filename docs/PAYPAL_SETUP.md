# PayPal Integration Setup Guide

This guide explains how to set up PayPal payment integration for the OOPshop checkout system.

## Prerequisites

1. A PayPal Business Account
2. Access to PayPal Developer Dashboard

## Backend Setup

### 1. Get PayPal API Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in with your PayPal Business account
3. Navigate to **Dashboard** → **My Apps & Credentials**
4. Create a new app or use an existing one
5. Copy your **Client ID** and **Secret**

### 2. Configure Environment Variables

Add the following to your `.env` file in the `backend` directory:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_secret_here
PAYPAL_MODE=sandbox  # Use 'sandbox' for testing, 'live' for production
FRONTEND_URL=http://localhost:3000  # Your frontend URL
```

### 3. Frontend Configuration

Add the following to your `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id_here
```

**Note:** Only the Client ID is needed on the frontend (it's safe to expose). The Secret should NEVER be exposed on the frontend.

## Testing

### Sandbox Testing

1. Use PayPal's sandbox environment for testing
2. Create test accounts at [PayPal Sandbox](https://developer.paypal.com/dashboard/accounts)
3. Use test buyer accounts to complete test transactions
4. Test with various scenarios:
   - Successful payment
   - Payment cancellation
   - Payment errors

### Test Accounts

PayPal provides test accounts in the sandbox:
- **Buyer Account**: Use for testing customer payments
- **Business Account**: Your merchant account

## Payment Flow

1. **Customer clicks "Continue to Payment"**
   - Creates invoice in database
   - Invoice status: `pending`

2. **PayPal Button Appears**
   - PayPal SDK loads
   - Backend creates PayPal order
   - PayPal button renders

3. **Customer Approves Payment**
   - Customer redirected to PayPal
   - Customer approves payment
   - Returns to checkout page

4. **Payment Capture**
   - Backend captures payment from PayPal
   - Payment record created in database
   - Invoice status updated to `paid`
   - Cart cleared
   - Redirect to success page

## API Endpoints

### Create PayPal Order
```
POST /payments/paypal/create-order
Body: {
  invoice_id: number,
  amount: string,
  currency: string (optional, default: "EUR"),
  description: string (optional)
}
```

### Capture PayPal Payment
```
POST /payments/paypal/capture
Body: {
  orderId: string,
  invoice_id: number,
  user_id: number (optional, will be fetched from invoice if not provided)
}
```

## Going Live

1. **Switch to Live Mode**
   - Update `PAYPAL_MODE=live` in backend `.env`
   - Update `NEXT_PUBLIC_PAYPAL_CLIENT_ID` with live Client ID
   - Update `PAYPAL_CLIENT_SECRET` with live Secret

2. **Verify Configuration**
   - Test with small real transaction
   - Monitor PayPal dashboard for transactions
   - Check payment records in database

3. **Security Checklist**
   - ✅ Secret stored only in backend
   - ✅ HTTPS enabled in production
   - ✅ Environment variables secured
   - ✅ Error handling implemented
   - ✅ Payment status verified before order completion

## Troubleshooting

### PayPal Button Not Appearing
- Check browser console for errors
- Verify `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set
- Check PayPal SDK script loads correctly

### Payment Capture Fails
- Verify PayPal credentials are correct
- Check PayPal mode (sandbox vs live)
- Review backend logs for error details
- Ensure invoice exists before capture

### Order Creation Fails
- Verify backend PayPal credentials
- Check network connectivity
- Review PayPal API response in logs

## Support

For PayPal API issues:
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Support](https://www.paypal.com/support)

For application issues:
- Check application logs
- Review error messages
- Verify environment configuration

