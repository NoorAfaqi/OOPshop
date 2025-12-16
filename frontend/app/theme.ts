import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f5f5f7", // subtle macOS-like grey
      paper: "#ffffff",
    },
    primary: {
      main: "#0071e3", // macOS-like blue accent
    },
    secondary: {
      main: "#6e6e73",
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow:
            "0 10px 30px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: "none",
        },
      },
    },
  },
  typography: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, system-ui, Segoe UI, sans-serif",
  },
});


