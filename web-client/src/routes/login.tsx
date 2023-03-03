import { Button } from '../components';
import { authorize } from '../spotifyAPI/authorization';

export default function Login() {
  return (
    <div className="flex h-screen bg-slate-50">
      <div className="m-auto shadow-md rounded-lg p-14 bg-white">
        <p className="text-slate-600">
          Authorize this application with Spotify to continue.
        </p>
        <br />
        <div className="w-fit m-auto">
          <Button onClick={authorize}>Sign in</Button>
        </div>
      </div>
    </div>
  );
}
