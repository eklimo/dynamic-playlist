import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';
import React, { useEffect, useMemo, useState } from 'react';
import { ChakraProvider, ColorModeScript, theme } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Navbar from './components/Navbar';
import Library from './routes/Library';
import Generate from './routes/Generate';
import { getAuthorization, parseAuthorizationURL, storeAuthorization } from './authorization';
import { AuthorizationContext } from './AuthorizationContext';

export const DEBUG = true;

const queryClient = new QueryClient();

export default function App() {
  const [authorizationState, setAuthorizationState] = useState(() => getAuthorization());

  useEffect(() => {
    if (authorizationState != null) {
      storeAuthorization(authorizationState);
    }
  }, [authorizationState]);

  const router = useMemo(() =>
      createBrowserRouter([
        {
          path: '/authorize',
          loader: async ({ request }) => {
            const state = parseAuthorizationURL(request.url);
            if (state != null) {
              setAuthorizationState(state);
            }

            return redirect('/');
          }
        },
        {
          path: '/',
          element: <Navbar />,
          children: [
            {
              path: '/',
              element: <Library />
            },
            {
              path: '/generate',
              element: <Generate />
            }
          ]
        }
      ])
    , []);

  return (
    <>
      <ColorModeScript />
      <QueryClientProvider client={queryClient}>
        {DEBUG && <ReactQueryDevtools initialIsOpen={false} />}

        <ChakraProvider theme={theme}>
          <AuthorizationContext.Provider value={authorizationState}>
            <RouterProvider router={router} />
          </AuthorizationContext.Provider>
        </ChakraProvider>
      </QueryClientProvider>
    </>
  );
}
