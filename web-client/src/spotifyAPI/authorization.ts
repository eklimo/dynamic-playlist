const clientID = '81faeccb6e6d4c94a1b2314b1819ac0c';
const clientSecret = '25cb56f9c296425f85364ea587472d06';
const authorizationHeader = 'Basic ' + btoa(`${clientID}:${clientSecret}`);

const hostname = 'https://accounts.spotify.com';
const authorizePath = 'authorize';
const tokenPath = 'api/token';
const scope = [
  'playlist-read-private',
  'playlist-modify-private',
  'playlist-modify-public',
  'user-library-read',
  'user-read-private',
  'user-read-email',
];
const redirectURI = 'http://localhost:8081/authorize';

const accessTokenKey = 'accessToken';

interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

interface RefreshedAccessTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
}

function storeToken(res: AccessTokenResponse) {
  console.log('set new token', res.access_token);
  window.localStorage.setItem(accessTokenKey, res.access_token);
  window.localStorage.setItem('refreshToken', res.refresh_token);
  window.localStorage.setItem(
    'refreshAt',
    new Date(Date.now() + 1000 * res.expires_in).toString()
  );
}

export function authorize() {
  const authorizeURL = new URL(authorizePath, hostname);
  authorizeURL.searchParams.append('response_type', 'code');
  authorizeURL.searchParams.append('client_id', clientID);
  authorizeURL.searchParams.append('scope', scope.join(' '));
  authorizeURL.searchParams.append('redirect_uri', redirectURI);
  authorizeURL.searchParams.append('state', '1234'); // TODO: state

  window.location.replace(authorizeURL);
}

export async function authorize2(urlString: string) {
  const url = new URL(urlString);

  if (url.searchParams.get('state') !== '1234') {
    // TODO: state
    console.error("state doesn't match");
    return;
  } else if (url.searchParams.has('error')) {
    console.error('error:', url.searchParams.get('error'));
    return;
  }

  const authorizationCode = url.searchParams.get('code') as string;

  const tokenURL = new URL(tokenPath, hostname);
  tokenURL.searchParams.append('grant_type', 'authorization_code');
  tokenURL.searchParams.append('code', authorizationCode);
  tokenURL.searchParams.append('redirect_uri', redirectURI);

  const response = await fetch(tokenURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: authorizationHeader,
    },
  });

  if (!response.ok) {
    console.error('response not ok');
    return;
  }

  const obj = (await response.json()) as AccessTokenResponse;
  storeToken(obj);
}

export function getToken() {
  return window.localStorage.getItem(accessTokenKey);
}

export function hasToken() {
  return getToken() != null;
}

export function removeToken() {
  window.localStorage.removeItem(accessTokenKey);
}
