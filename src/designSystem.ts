import { createTheme } from "@mui/material/styles";

export const toolbarControlHeight = 36;

export const editorTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#fafafa",
      paper: "#ffffff"
    },
    text: {
      primary: "#171717",
      secondary: "#737373"
    },
    primary: {
      main: "#171717",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#737373"
    },
    error: {
      main: "#dc2626"
    },
    divider: "#e5e5e5"
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: "1.5rem",
      lineHeight: 1.2,
      fontWeight: 650,
      letterSpacing: 0
    },
    h2: {
      fontSize: "0.95rem",
      lineHeight: 1.3,
      fontWeight: 650,
      letterSpacing: 0
    },
    button: {
      textTransform: "none",
      fontWeight: 550
    }
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: toolbarControlHeight,
          minHeight: toolbarControlHeight
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: 0,
          height: toolbarControlHeight,
          minHeight: toolbarControlHeight,
          paddingInline: 10,
          textTransform: "none",
          fontWeight: 550,
          gap: 6,
          color: "#737373",
          "&.Mui-selected": {
            color: "#ffffff",
            backgroundColor: "#171717"
          },
          "&.Mui-selected:hover": {
            backgroundColor: "#262626"
          }
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    }
  }
});
