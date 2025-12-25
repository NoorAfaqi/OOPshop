"use client";

import { Box, Typography, Link, Divider } from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import { useRouter } from "next/navigation";

export default function AccountFooter() {
  const router = useRouter();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "white",
        borderTop: "1px solid",
        borderColor: "divider",
        py: 3,
        mt: 3,
        px: 3,
      }}
    >
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
            onClick={() => router.push("/")}
          >
            <StoreIcon sx={{ fontSize: 24, color: "#667eea" }} />
            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                fontWeight: 600,
                letterSpacing: "-0.3px",
              }}
            >
              OOPshop
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Link
              component="button"
              onClick={() => router.push("/shop")}
              sx={{
                color: "text.secondary",
                textDecoration: "none",
                fontSize: "0.875rem",
                transition: "color 0.2s",
                "&:hover": { color: "#667eea" },
              }}
            >
              Shop
            </Link>
            <Link
              href="#"
              sx={{
                color: "text.secondary",
                textDecoration: "none",
                fontSize: "0.875rem",
                transition: "color 0.2s",
                "&:hover": { color: "#667eea" },
              }}
            >
              Support
            </Link>
            <Link
              href="#"
              sx={{
                color: "text.secondary",
                textDecoration: "none",
                fontSize: "0.875rem",
                transition: "color 0.2s",
                "&:hover": { color: "#667eea" },
              }}
            >
              Privacy
            </Link>
            <Link
              href="#"
              sx={{
                color: "text.secondary",
                textDecoration: "none",
                fontSize: "0.875rem",
                transition: "color 0.2s",
                "&:hover": { color: "#667eea" },
              }}
            >
              Terms
            </Link>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "block",
            textAlign: "center",
          }}
        >
          © {new Date().getFullYear()} OOPshop. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

