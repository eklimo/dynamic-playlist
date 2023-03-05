import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React, { useMemo } from 'react';
import { ChakraProvider, ColorModeScript, theme } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Navbar from './components/Navbar';
import Library from './routes/Library';
import Generate from './routes/Generate';

export const DEBUG = true;

const queryClient = new QueryClient();

export default function App() {

  const router = useMemo(() =>
      createBrowserRouter([
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
          <RouterProvider router={router} />
        </ChakraProvider>
      </QueryClientProvider>
    </>
  );
}
