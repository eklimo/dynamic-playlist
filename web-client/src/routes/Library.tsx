import { Heading, useToast, UseToastOptions } from '@chakra-ui/react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AddTagToTrackRequest,
  fetchSavedTracks,
  fetchTag,
  fetchTagsForTrack,
  fetchTagsForUser,
  fetchUserProfile,
  mutateAddTagToTrack,
  mutateCreateTag,
  mutateDeleteTag,
  mutateRemoveTagFromTrack,
  mutateUpdateTag,
  RemoveTagFromTrackRequest,
  UpdateTagRequest
} from '../fetch';
import React, { useCallback, useContext, useMemo } from 'react';
import TrackTable, { TrackWithTags } from '../components/TrackTable';
import { AuthorizationContext } from '../AuthorizationContext';
import { Tag } from '../model';

const STALE_TIME = 1000 * 60 * 5;

export default function Library() {
  const queryClient = useQueryClient();

  const authorizationState = useContext(AuthorizationContext);

  const toast = useToast();
  const doToast = useCallback((options: UseToastOptions) => {
    toast({
      status: 'success',
      isClosable: true,
      position: 'top',
      ...options
    });
  }, [toast]);

  const offset = 0;
  const limit = 50;

  const userProfileQuery = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => fetchUserProfile(authorizationState!.accessToken),
    staleTime: STALE_TIME,
    enabled: !!authorizationState
  });

  const savedTracksQuery = useQuery({
    queryKey: ['savedTracks'],
    queryFn: () => fetchSavedTracks(authorizationState!.accessToken, offset, limit),
    staleTime: STALE_TIME,
    enabled: !!authorizationState
  });

  const tagsForUserQuery = useQuery({
    queryKey: ['tagsForUser'],
    queryFn: () => fetchTagsForUser(userProfileQuery.data!.id),
    staleTime: STALE_TIME,
    enabled: !!userProfileQuery.data
  });

  const tagQueries = useQueries({
    queries: (tagsForUserQuery.data?.tagIDs ?? []).map(tagID => ({
        queryKey: ['tag', tagID],
        queryFn: () => fetchTag(tagID),
        staleTime: STALE_TIME
      }
    ))
  });

  const tags = useMemo(() =>
      new Map(
        tagQueries
          .map(query => query.data)
          .map(tag => [tag?.tagID, tag])
      )
    , [tagQueries]);

  const tagsForTrackQueries = useQueries({
    queries: ((savedTracksQuery.data?.items ?? []).map(track => ({
      queryKey: ['tagsForTrack', track.trackID],
      queryFn: async () => {
        const x = await fetchTagsForTrack({
          trackID: track.trackID,
          userID: userProfileQuery.data!.id
        });
        return {
          ...x,
          trackID: track.trackID
        };
      },
      staleTime: STALE_TIME,
      enabled: !!userProfileQuery.data
    })))
  });

  const tagsForTrack = useMemo(() =>
      new Map(
        tagsForTrackQueries
          .map(query => query.data)
          .map(obj => [obj?.trackID, obj?.tagIDs])
      )
    , [tagsForTrackQueries]);

  const createTagMutation = useMutation({
    mutationFn: () => {
      const userID = 'XYZ';
      const name = (Math.random() + 1).toString(36).substring(7);
      const color = Math.floor(Math.random() * 10);
      const description = '';
      return mutateCreateTag(userID, name, color, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tagsForUser']);
    }
  });

  const deleteTagMutation = useMutation({
    mutationFn: mutateDeleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries(['tagsForUser']);
    }
  });

  const updateTagMutation = useMutation({
    mutationFn: (request: UpdateTagRequest) => mutateUpdateTag(request),
    onSuccess: (response, { tagID }: UpdateTagRequest) => {
      queryClient.invalidateQueries(['tag', tagID]);
    }
  });

  const addTagToTrackMutation = useMutation({
    mutationFn: (request: AddTagToTrackRequest) => mutateAddTagToTrack(request),
    onSuccess: (response, { trackID }: AddTagToTrackRequest) => {
      queryClient.invalidateQueries(['tagsForTrack', trackID]);
    }
  });

  const removeTagFromTrackMutation = useMutation({
    mutationFn: (request: RemoveTagFromTrackRequest) => mutateRemoveTagFromTrack(request),
    onSuccess: (response, { trackID, tagID }: RemoveTagFromTrackRequest) => {
      doToast({
        title: `Removed tag ${tags.get(tagID)!.name}`
      });

      queryClient.invalidateQueries(['tagsForTrack', trackID]);
    }
  });

  const removeTagFromTrack = useCallback((tag: Tag, trackID: string) => {
    removeTagFromTrackMutation.mutate({
      trackID,
      tagID: tag.tagID
    });
  }, []);

  const tracksWithTags = useMemo(() =>
      savedTracksQuery.data?.items
        ?.map(track => ({
          ...track,
          tags: tagsForTrack.get(track.trackID)?.map(tagID => tags.get(tagID)!) ?? []
        } satisfies TrackWithTags)) ?? []
    , [savedTracksQuery.data, tagsForTrack, tags]);

  return (
    <>
      <Heading fontSize='3xl' fontWeight='semibold' pb='25px'>Library</Heading>

      <TrackTable tracks={tracksWithTags} removeTagFromTrack={removeTagFromTrack} />
    </>
  );
}
