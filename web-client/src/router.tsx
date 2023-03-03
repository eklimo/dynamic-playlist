import { createBrowserRouter, redirect } from 'react-router-dom';
import Navbar from './navbar';
import Home from './routes/home';
import Login from './routes/login';
import { authorize2, hasToken } from './spotifyAPI/authorization';

const loginRedirectLoader = async () =>
  !hasToken() ? redirect('/login') : null;

export default createBrowserRouter([
  {
    path: '/authorize',
    loader: async ({ request }) => {
      await authorize2(request.url);
      return redirect('/');
    },
  },
  {
    path: '/',
    element: <Navbar />,
    children: [
      {
        path: '/login',
        element: <Login />,
        loader: async () => (hasToken() ? redirect('/') : null),
      },
      {
        path: '/',
        element: <Home />,
        loader: loginRedirectLoader,
      },
    ],
  },
]);
