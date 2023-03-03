import { getToken, hasToken } from './authorization';

const apiPath = 'https://api.spotify.com/v1';
const CODE_TOKEN_EXPIRED = 401;
const CODE_OAUTH_ERROR = 403;
const CODE_RATE_LIMIT = 429;

export interface UserProfile {
  country: string;
  display_name?: string;
  email: string;
  // explicit_content
  // external_urls
  // followers
  href: string;
  id: string;
  // images
  product: string;
  type: string;
  uri: string;
}

async function safeRequest(
  input: URL | RequestInfo,
  init?: RequestInit | undefined
) {
  if (!hasToken()) {
    throw new Error('No access token');
  }

  console.log(input);
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (response.status === CODE_TOKEN_EXPIRED) {
    throw new Error('Token expired');
  } else if (response.status === CODE_OAUTH_ERROR) {
    throw new Error('OAuth error');
  } else if (response.status === CODE_RATE_LIMIT) {
    throw new Error('Rate limited');
  } else if (!response.ok) {
    throw new Error('Response not ok');
  }

  return response.json();
}

export const getUserProfile = async () =>
  (await safeRequest(new URL(apiPath + '/me'))) as UserProfile;
