const accessTokenKey = 'accessToken';
const expiresInKey = 'expiresIn';
const refreshTokenKey = 'refreshToken';

export interface AuthorizationState {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export function parseAuthorizationURL(urlStr: string): AuthorizationState | null {
  const url = new URL(urlStr);

  const accessToken = url.searchParams.get('access_token');
  const expiresInStr = url.searchParams.get('expires_in');
  const refreshToken = url.searchParams.get('refresh_token');

  if (accessToken == null || expiresInStr == null || refreshToken == null) {
    return null;
  }

  return {
    accessToken,
    expiresIn: parseInt(expiresInStr),
    refreshToken
  };
}

export function storeAuthorization(state: AuthorizationState) {
  window.localStorage.setItem(accessTokenKey, state.accessToken);
  window.localStorage.setItem(expiresInKey, String(state.expiresIn));
  window.localStorage.setItem(refreshTokenKey, state.refreshToken);
}

export function getAuthorization(): AuthorizationState | null {
  const accessToken = window.localStorage.getItem(accessTokenKey);
  const expiresInStr = window.localStorage.getItem(expiresInKey);
  const refreshToken = window.localStorage.getItem(refreshTokenKey);

  if (accessToken == null || expiresInStr == null || refreshToken == null) {
    return null;
  }

  return {
    accessToken,
    expiresIn: parseInt(expiresInStr),
    refreshToken
  };
}

export function clearAuthorization() {
  window.localStorage.removeItem(accessTokenKey);
  window.localStorage.removeItem(expiresInKey);
  window.localStorage.removeItem(refreshTokenKey);
}
