"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Paper,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/config/api.config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

interface Product {
  id: number;
  name: string;
  price: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    billing_street: "",
    billing_zip: "",
    billing_city: "",
    billing_country: "",
  });

  useEffect(() => {
    const loadCheckoutData = async () => {
      if (typeof window !== "undefined") {
        // Load cart
        const saved = localStorage.getItem(STORAGE_KEYS.CART);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setCart(parsed);
            if (parsed.length === 0) {
              router.push("/cart");
              return;
            }
          } catch {
            router.push("/cart");
            return;
          }
        } else {
          router.push("/cart");
          return;
        }

        // Check if user is authenticated
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          setIsAuthenticated(true);
          setIsGuest(false);
          setLoadingUser(true);

          // Load user data and pre-fill form
          try {
            const userRes = await fetch(`${API_BASE}/account/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (userRes.ok) {
              const userData = await userRes.json();
              // Handle both response formats: { data: {...} } or direct user object
              const user = userData.data || userData;
              
              // Pre-fill form with user data from database
              setForm({
                email: user.email || "",
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                phone: user.phone || "",
                billing_street: user.billing_street || "",
                billing_zip: user.billing_zip || "",
                billing_city: user.billing_city || "",
                billing_country: user.billing_country || "",
              });
            } else {
              // If API fails, try to get from localStorage as fallback
              const userDataStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);
              if (userDataStr) {
                try {
                  const user = JSON.parse(userDataStr);
                  setForm({
                    email: user.email || "",
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    phone: user.phone || "",
                    billing_street: user.billing_street || "",
                    billing_zip: user.billing_zip || "",
                    billing_city: user.billing_city || "",
                    billing_country: user.billing_country || "",
                  });
                } catch (parseErr) {
                  console.error("Error parsing user data from localStorage:", parseErr);
                }
              }
            }
          } catch (err) {
            console.error("Error loading user data:", err);
            // Fallback to localStorage if API call fails
            const userDataStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);
            if (userDataStr) {
              try {
                const user = JSON.parse(userDataStr);
                setForm({
                  email: user.email || "",
                  first_name: user.first_name || "",
                  last_name: user.last_name || "",
                  phone: user.phone || "",
                  billing_street: user.billing_street || "",
                  billing_zip: user.billing_zip || "",
                  billing_city: user.billing_city || "",
                  billing_country: user.billing_country || "",
                });
              } catch (parseErr) {
                console.error("Error parsing user data from localStorage:", parseErr);
              }
            }
          } finally {
            setLoadingUser(false);
          }
        } else {
          setLoadingUser(false);
        }
      }
    };

    loadCheckoutData();
  }, [router]);

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Create invoice first, then show PayPal button
  const createInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== "undefined" 
        ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) 
        : null;

      // Prepare checkout data
      const checkoutData: any = {
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      if (isAuthenticated && token) {
        // For authenticated users, use the authenticated endpoint
        const checkoutRes = await fetch(`${API_BASE}/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(checkoutData),
        });

        if (!checkoutRes.ok) {
          const errorData = await checkoutRes.json().catch(() => ({}));
          throw new Error(errorData.message || "Checkout failed");
        }

        const invoice = await checkoutRes.json();
        const invoiceId = invoice.id || invoice.data?.id;
        setInvoiceId(invoiceId);
        
        // Load PayPal and create order
        await loadPayPalAndCreateOrder(invoiceId);
      } else {
        // For guest checkout, include all form data
        checkoutData.first_name = form.first_name;
        checkoutData.last_name = form.last_name;
        checkoutData.phone = form.phone || undefined;
        checkoutData.billing_street = form.billing_street;
        checkoutData.billing_zip = form.billing_zip;
        checkoutData.billing_city = form.billing_city;
        checkoutData.billing_country = form.billing_country;

        // Only include email if user wants to create an account
        if (!isGuest && form.email) {
          checkoutData.email = form.email;
        }

        // Use public checkout endpoint
        const checkoutRes = await fetch(`${API_BASE}/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(checkoutData),
        });

        if (!checkoutRes.ok) {
          const errorData = await checkoutRes.json().catch(() => ({}));
          throw new Error(errorData.message || "Checkout failed");
        }

        const invoice = await checkoutRes.json();
        const invoiceId = invoice.id || invoice.data?.id;
        setInvoiceId(invoiceId);
        
        // Load PayPal and create order
        await loadPayPalAndCreateOrder(invoiceId);
      }
    } catch (err: any) {
      setError(err.message || "Checkout failed");
      setLoading(false);
    }
  };

  // Load PayPal SDK and create order
  const loadPayPalAndCreateOrder = async (invoiceId: number) => {
    if (!PAYPAL_CLIENT_ID) {
      setError("PayPal is not configured. Please contact support.");
      setLoading(false);
      return;
    }

    // Load PayPal SDK if not already loaded
    if (!window.paypal) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR`;
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
        renderPayPalButton(invoiceId);
      };
      script.onerror = () => {
        setError("Failed to load PayPal SDK");
        setLoading(false);
      };
      document.body.appendChild(script);
    } else {
      setPaypalLoaded(true);
      renderPayPalButton(invoiceId);
    }
  };

  // Render PayPal button
  const renderPayPalButton = async (invoiceId: number) => {
    if (!window.paypal || !paypalButtonContainerRef.current) {
      return;
    }

    // Clear previous button
    if (paypalButtonContainerRef.current) {
      paypalButtonContainerRef.current.innerHTML = "";
    }

    try {
      window.paypal.Buttons({
        createOrder: async () => {
          // Create PayPal order on backend
          const response = await fetch(`${API_BASE}/payments/paypal/create-order`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              invoice_id: invoiceId,
              amount: total.toFixed(2),
              currency: "EUR",
              description: `Order #${invoiceId}`,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to create PayPal order");
          }

          const data = await response.json();
          const order = data.data || data;
          return order.id;
        },
        onApprove: async (data: any) => {
          setLoading(true);
          try {
            const token = typeof window !== "undefined" 
              ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) 
              : null;

            // Get user_id if authenticated (optional - backend will get from invoice if not provided)
            let userId = null;
            if (isAuthenticated && token) {
              const userDataStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);
              if (userDataStr) {
                const user = JSON.parse(userDataStr);
                userId = user.id;
              }
            }

            // Capture payment (user_id is optional - backend will get from invoice)
            const captureRes = await fetch(`${API_BASE}/payments/paypal/capture`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                orderId: data.orderID,
                invoice_id: invoiceId,
                ...(userId ? { user_id: userId } : {}),
              }),
            });

            if (!captureRes.ok) {
              const errorData = await captureRes.json().catch(() => ({}));
              throw new Error(errorData.message || "Payment capture failed");
            }

            // Clear cart
            localStorage.removeItem(STORAGE_KEYS.CART);
            setCart([]);

            // Redirect to success page
            router.push(`/checkout/success?id=${invoiceId}`);
          } catch (err: any) {
            setError(err.message || "Payment processing failed");
            setLoading(false);
          }
        },
        onError: (err: any) => {
          console.error("PayPal error:", err);
          setError("PayPal payment failed. Please try again.");
          setLoading(false);
        },
        onCancel: () => {
          setError("Payment was cancelled");
          setLoading(false);
        },
      }).render(paypalButtonContainerRef.current);

      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to initialize PayPal");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInvoice();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <Toolbar>
          <IconButton onClick={() => router.push("/cart")} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <StoreIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, color: "text.primary", fontWeight: 600 }}
          >
            Checkout
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
          <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 calc(66.666% - 12px)" } }}>
            {!isAuthenticated && (
              <Card sx={{ p: 3, mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" fontWeight={600}>
                    Checkout Type
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Chip
                    label="Guest Checkout"
                    icon={<PersonIcon />}
                    onClick={() => setIsGuest(true)}
                    color={isGuest ? "primary" : "default"}
                    variant={isGuest ? "filled" : "outlined"}
                    sx={{ flex: 1, py: 2.5, fontSize: "0.95rem" }}
                  />
                  <Chip
                    label="Create Account"
                    icon={<EmailIcon />}
                    onClick={() => setIsGuest(false)}
                    color={!isGuest ? "primary" : "default"}
                    variant={!isGuest ? "filled" : "outlined"}
                    sx={{ flex: 1, py: 2.5, fontSize: "0.95rem" }}
                  />
                </Box>
                {isGuest ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Quick checkout without creating an account
                  </Alert>
                ) : (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Create an account to track your orders
                  </Alert>
                )}
              </Card>
            )}
            
            {isAuthenticated && (
              <Card sx={{ p: 3, mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" fontWeight={600}>
                    Checkout as {form.first_name} {form.last_name}
                  </Typography>
                </Box>
                <Alert severity="success" sx={{ mt: 1 }}>
                  Your account information will be used for this order
                </Alert>
              </Card>
            )}

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Billing Information
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {loadingUser && isAuthenticated && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Loading your information...
                  </Typography>
                </Box>
              )}
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {!isAuthenticated && !isGuest && (
                    <>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                        helperText="We'll create an account for you"
                      />
                      <Divider />
                    </>
                  )}
                  {isAuthenticated && (
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={form.email}
                      disabled
                      helperText="Your account email"
                    />
                  )}
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      required={!isAuthenticated}
                      value={form.first_name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, first_name: e.target.value }))
                      }
                      disabled={isAuthenticated}
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      required={!isAuthenticated}
                      value={form.last_name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, last_name: e.target.value }))
                      }
                      disabled={isAuthenticated}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    disabled={isAuthenticated}
                  />
                  <TextField
                    fullWidth
                    label="Street Address"
                    required={!isAuthenticated}
                    value={form.billing_street}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, billing_street: e.target.value }))
                    }
                    disabled={isAuthenticated}
                  />
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      required={!isAuthenticated}
                      value={form.billing_zip}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, billing_zip: e.target.value }))
                      }
                      disabled={isAuthenticated}
                    />
                    <TextField
                      fullWidth
                      label="City"
                      required={!isAuthenticated}
                      value={form.billing_city}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, billing_city: e.target.value }))
                      }
                      disabled={isAuthenticated}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Country"
                    required={!isAuthenticated}
                    value={form.billing_country}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, billing_country: e.target.value }))
                    }
                    disabled={isAuthenticated}
                  />
                  {isAuthenticated && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      To update your billing information, please visit your{" "}
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => router.push("/account/settings")}
                        sx={{ textTransform: "none", p: 0, minWidth: "auto" }}
                      >
                        account settings
                      </Button>
                    </Alert>
                  )}
                </Box>
              </form>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 calc(33.333% - 12px)" } }}>
            <Paper sx={{ p: 3, position: "sticky", top: 80 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Order Summary
              </Typography>
              {cart.map((item) => (
                <Box
                  key={item.product.id}
                  sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
                >
                  <Typography variant="body2">
                    {item.product.name} × {item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    €{(item.product.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
              <Box
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                  pt: 2,
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Total
                </Typography>
                <Typography variant="h6" fontWeight={600} color="primary.main">
                  €{total.toFixed(2)}
                </Typography>
              </Box>
              {!invoiceId ? (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ mt: 3, borderRadius: 999 }}
                >
                  {loading ? "Processing..." : "Continue to Payment"}
                </Button>
              ) : (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: "center" }}>
                    Complete your payment with PayPal
                  </Typography>
                  <Box ref={paypalButtonContainerRef} id="paypal-button-container" />
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
