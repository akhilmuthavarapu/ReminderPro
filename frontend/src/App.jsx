import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { appRoutes } from './routes';

// Configuration for Future Flags to silence v7 upgrade warnings
const FUTURE_FLAGS = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true,
  v7_partialHydration: true,
  v7_skipActionErrorRevalidation: true,
};

// Define the modern Data Router
const router = createBrowserRouter(
  [
    ...appRoutes.map((route) => ({
      path: route.path,
      element: <RouteWrapper route={route} />
    })),
    // Final fallback
    {
      path: "*",
      element: <Navigate to="/" replace />
    }
  ],
  {
    future: FUTURE_FLAGS,
  }
);

// Wrapper to handle Public/Protected logic
function RouteWrapper({ route }) {
  const { isAuthenticated } = useAuth();
  
  if (route.isPublic && isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return route.element;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider 
           router={router} 
           future={FUTURE_FLAGS} 
        />
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'dark:bg-slate-800 dark:text-white dark:border dark:border-slate-700 font-semibold text-xs rounded-md px-4 py-3 shadow-xl',
            duration: 3000,
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
