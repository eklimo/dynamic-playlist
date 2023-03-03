import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from './components';
import { getUserProfile, UserProfile } from './spotifyAPI';
import { hasToken, removeToken } from './spotifyAPI/authorization';

function NavbarLink({ children, to }: { children?: any; to: string }) {
  return (
    <Link className="text-white font-semibold" to={to}>
      {children}
    </Link>
  );
}

export default function Navbar() {
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    getUserProfile()
      .then((response) => {
        setUserProfile(response);
      })
      .catch((error) => {
        setError(true);
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <nav className="bg-gray-900 h-12 flex flex-row p-2 space-x-2">
        <div className="space-x-10 h-full flex">
          <p className="text-white font-extrabold text-2xl inline h-fit my-auto">
            Dynamic Playlist
          </p>

          <ul className="space-x-8 inline h-fit my-auto">
            <NavbarLink to="/">Link one</NavbarLink>
            <NavbarLink to="/">Link two</NavbarLink>
            <NavbarLink to="/">Link three</NavbarLink>
          </ul>
        </div>
        <div className="grow" />
        {hasToken() && (
          <div className="my-auto space-x-2">
            <p className="text-white inline">
              {error
                ? 'Error!'
                : loading
                ? 'Loading...'
                : `Signed in as ${userProfile?.display_name}`}
            </p>
            <Button
              onClick={() => {
                removeToken();
                window.location.replace('/login');
              }}
            >
              Sign out
            </Button>
          </div>
        )}
      </nav>

      <Outlet />
    </div>
  );
}
