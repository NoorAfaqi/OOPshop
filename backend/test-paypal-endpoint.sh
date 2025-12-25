#!/bin/bash

# Test PayPal create-order endpoint without authentication
echo "Testing PayPal create-order endpoint (no auth)..."
echo ""

curl -X POST http://localhost:5000/payments/paypal/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_id": 1,
    "amount": "10.00",
    "currency": "EUR",
    "description": "Test Order"
  }' \
  -v

echo ""
echo ""
echo "Test completed!"

