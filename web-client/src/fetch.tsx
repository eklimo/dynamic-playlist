import FilterMode from './filterMode';
import { Image, Tag, Track } from './model';

const apiPath = 'http://localhost:8080/api/v1';

//

export interface UserProfileResponse {
  id: string;
  displayName: string;
}

const fetchUserProfileURL = () => {
  const url = new URL(`${apiPath}/library/profile`);
  return url.href;
};

export async function fetchUserProfile(accessToken: string): Promise<UserProfileResponse> {
  const response = await fetch(fetchUserProfileURL(), {
    method: 'get',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return await response.json();
}

//

export interface SavedTracksResponse {
  total: number,
  items: Track[]
}

const fetchSavedTracksURL = (offset: number, limit: number) => {
  const url = new URL(`${apiPath}/library/tracks`);
  url.searchParams.append('offset', String(offset));
  url.searchParams.append('limit', String(limit));
  return url.href;
};

export async function fetchSavedTracks(accessToken: string, offset: number, limit: number): Promise<SavedTracksResponse> {
  const response = await fetch(fetchSavedTracksURL(offset, limit), {
    method: 'get',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return await response.json();
}

//

export interface TagsForUserResponse {
  tagIDs: number[];
}

const fetchTagsForUserURL = (user: string) => {
  const url = new URL(`${apiPath}/tags`);
  url.searchParams.append('user', user);
  return url.href;
};

export async function fetchTagsForUser(user: string): Promise<TagsForUserResponse> {
  const response = await fetch(fetchTagsForUserURL(user), {
    method: 'get'
  });
  return await response.json();
}

//

export type GetTagResponse = Tag

const fetchTagURL = (tagID: number) => {
  const url = new URL(`${apiPath}/tags/${tagID}`);
  return url.href;
};

export async function fetchTag(tagID: number): Promise<GetTagResponse> {
  const response = await fetch(fetchTagURL(tagID), {
    method: 'get'
  });
  return await response.json();
}

//

export interface CreateTagRequest {
  userID: string,
  name: string,
  color: number,
  description?: string
}

export interface CreateTagResponse {
  tagID: number;
}

const mutateCreateTagURL = () => {
  const url = new URL(`${apiPath}/tags`);
  return url.href;
};

export async function mutateCreateTag(req: CreateTagRequest)
  : Promise<CreateTagResponse> {
  const response = await fetch(mutateCreateTagURL(), {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req)
  });
  return await response.json();
}

//

const mutateDeleteTagURL = (tagID: number) => {
  const url = new URL(`${apiPath}/tags/${tagID}`);
  return url.href;
};

export async function mutateDeleteTag(tagID: number): Promise<void> {
  await fetch(mutateDeleteTagURL(tagID), {
    method: 'delete'
  });
}

//

export interface UpdateTagRequest {
  tagID: number,
  name?: string,
  color?: number,
  description?: string
}

const mutateUpdateTagURL = (tagID: number) => {
  const url = new URL(`${apiPath}/tags/${tagID}`);
  return url.href;
};

export async function mutateUpdateTag({ tagID, name, color, description }: UpdateTagRequest): Promise<void> {
  await fetch(mutateUpdateTagURL(tagID), {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name, color, description
    })
  });
}

//

export interface AddTagToTrackRequest {
  trackID: string,
  tagID: number,
}

const mutateAddTagToTrackURL = (trackID: string) => {
  const url = new URL(`${apiPath}/tracks/${trackID}`);
  return url.href;
};

export async function mutateAddTagToTrack({ trackID, tagID }: AddTagToTrackRequest): Promise<void> {
  await fetch(mutateAddTagToTrackURL(trackID), {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tagID
    })
  });
}

//

export interface RemoveTagFromTrackRequest {
  trackID: string,
  tagID: number,
}

const mutateRemoveTagFromTrackURL = (trackID: string) => {
  const url = new URL(`${apiPath}/tracks/${trackID}`);
  return url.href;
};

export async function mutateRemoveTagFromTrack({ trackID, tagID }: RemoveTagFromTrackRequest): Promise<void> {
  await fetch(mutateRemoveTagFromTrackURL(trackID), {
    method: 'delete',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tagID
    })
  });
}

//

export interface TagsForTrackRequest {
  trackID: string,
  userID: string
}

export interface TagsForTrackResponse {
  tagIDs: number[];
}

const fetchTagsForTrackURL = (trackID: string, userID: string) => {
  const url = new URL(`${apiPath}/tracks/${trackID}?user=${userID}`);
  return url.href;
};

export async function fetchTagsForTrack({ trackID, userID }: TagsForTrackRequest): Promise<TagsForTrackResponse> {
  const response = await fetch(fetchTagsForTrackURL(trackID, userID), {
    method: 'get'
  });
  return await response.json();
}

//

export interface GeneratePlaylistRequest {
  userID: string,
  include: number[],
  exclude: number[],
  mode: FilterMode,
  name: string,
  description?: string,
}

export interface GeneratePlaylistResponse {
  url: string,
  image: Image,
}

const mutateGeneratePlaylistURL = () => {
  const url = new URL(`${apiPath}/generate`);
  return url.href;
};

export async function mutateGeneratePlaylist(req: GeneratePlaylistRequest, accessToken: string): Promise<GeneratePlaylistResponse> {
  const response = await fetch(mutateGeneratePlaylistURL(), {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(req)
  });
  return await response.json();
}
