import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#226b5e', contrastText: '#f8fbf8' },
    secondary: { main: '#b65f28' },
    background: { default: '#f3f0e8', paper: '#fffdf7' },
    text: { primary: '#25231f', secondary: '#615f58' }
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { border: '1px solid rgba(45, 42, 35, 0.12)', boxShadow: '0 8px 24px rgba(35, 31, 24, 0.08)' }
      }
    },
    MuiButton: { defaultProps: { disableElevation: true } }
  }
});
