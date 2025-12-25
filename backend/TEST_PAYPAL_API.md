# Testing PayPal API Endpoints

## Important: Restart Backend Server First!

**Before testing, you MUST restart your backend server** for the middleware changes to take effect:

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

## Test Commands

### Windows PowerShell

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File test-paypal-endpoint.ps1
```

### Manual Test (PowerShell)

```powershell
$body = @{
    invoice_id = 1
    amount = "10.00"
    currency = "EUR"
    description = "Test Order"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/payments/paypal/create-order" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Manual Test (curl - if available)

```bash
curl -X POST http://localhost:5000/payments/paypal/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_id": 1,
    "amount": "10.00",
    "currency": "EUR",
    "description": "Test Order"
  }'
```

## Expected Results

### ✅ Success (No Auth Required)
- Status: 200 OK
- Response contains PayPal order details
- No "No token provided" error

### ❌ Failure (Still Requires Auth)
- Status: 401 Unauthorized
- Error: "No token provided"
- **Solution**: Restart backend server

## Troubleshooting

1. **Still getting 401?**
   - Make sure backend server is restarted
   - Check that `backend/src/middleware/auth.js` has the updated code
   - Check that `backend/src/routes/payments.js` has `authMiddleware(null, false)` on PayPal routes
   - Check that `backend/src/app.js` doesn't apply auth middleware to `/payments` route

2. **PayPal credentials error?**
   - Make sure `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set in `backend/.env`
   - Check that PayPal mode is set correctly (`PAYPAL_MODE=sandbox` for testing)

3. **Connection refused?**
   - Make sure backend server is running on port 5000
   - Check `http://localhost:5000/health` first

