import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { router } from './router';
import { theme } from './styles/theme';
import { useAuthStore } from './stores/authStore';

function Bootstrap() {
  const profile = useAuthStore((state) => state.profile);
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    profile().catch(() => undefined);
    const handler = (event: Event) => enqueueSnackbar((event as CustomEvent<string>).detail, { variant: 'error' });
    window.addEventListener('app:error', handler);
    return () => window.removeEventListener('app:error', handler);
  }, [enqueueSnackbar, profile]);
  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3} autoHideDuration={2600}>
        <Bootstrap />
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>
);
