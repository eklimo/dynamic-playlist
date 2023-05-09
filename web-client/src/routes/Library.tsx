import { Center, Heading, Spinner, useDisclosure, useToast, UseToastOptions } from '@chakra-ui/react';
import { useInfiniteQuery, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AddTagToTrackRequest,
  CreateTagRequest,
  fetchSavedTracksPaginated,
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
import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import TrackTable, { TrackWithTags } from '../components/TrackTable';
import { AuthorizationContext } from '../AuthorizationContext';
import { Tag } from '../model';
import { TagsContext } from '../TagsContext';
import CreateTagModal from '../components/CreateTagModal';
import { OpenModalContext } from '../OpenModalContext';
import { useWindowVirtualizer } from '@tanstack/react-virtual';

const STALE_TIME = 1000 * 60 * 5;
const PAGE_SIZE = 50;

export default function Library() {
  const authorizationState = useContext(AuthorizationContext);

  const queryClient = useQueryClient();

  const toast = useToast();
  const doToast = useCallback((options: UseToastOptions) => {
    toast({
      status: 'success',
      isClosable: true,
      position: 'top',
      ...options
    });
  }, [toast]);

  const limit = 50;

  const userProfileQuery = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => fetchUserProfile(authorizationState!.accessToken),
    staleTime: STALE_TIME,
    enabled: !!authorizationState
  });

  const savedTracksQuery = useInfiniteQuery({
    queryKey: ['savedTracks'],
    queryFn: ({ pageParam = 0 }) => fetchSavedTracksPaginated(authorizationState!.accessToken, pageParam, limit),
    getNextPageParam: lastPage => lastPage.nextPageIndex,
    staleTime: STALE_TIME,
    enabled: !!authorizationState
  });

  const totalNumTracks = useMemo(() =>
      savedTracksQuery.data?.pages[0]?.data.count
    , [savedTracksQuery.data]);

  const savedTracks = useMemo(() =>
      authorizationState ? savedTracksQuery.data?.pages.flatMap(page => page.data.tracks) ?? [] : []
    , [savedTracksQuery.data, authorizationState]);

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
    queries: (savedTracks.map(track => ({
      queryKey: ['tagsForTrack', track.id],
      queryFn: async () => {
        const x = await fetchTagsForTrack({
          trackID: track.id,
          userID: userProfileQuery.data!.id
        });
        return {
          ...x,
          trackID: track.id
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
    mutationFn: (request: CreateTagRequest) => mutateCreateTag(request),
    onSuccess: (response, { name }: CreateTagRequest) => {
      doToast({
        title: `Created tag ${name}`
      });

      queryClient.invalidateQueries(['tagsForUser']);
    }
  });

  const createTag = useCallback((name: string, color: number) => {
    createTagMutation.mutate({
      userID: userProfileQuery.data!.id,
      name,
      color,
      description: undefined
    });
  }, [createTagMutation, userProfileQuery.data]);

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

  const addTagToTrack = useCallback((tag: Tag, trackID: string) => {
    addTagToTrackMutation.mutate({
      trackID,
      tagID: tag.tagID
    });
  }, [addTagToTrackMutation]);

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
  }, [removeTagFromTrackMutation]);

  const tracksWithTags = useMemo(() =>
      savedTracks?.map(track => ({
        ...track,
        tags: tagsForTrack.get(track.id)?.map(tagID => tags.get(tagID)!) ?? []
      } satisfies TrackWithTags)) ?? []
    , [tagsForTrack, tags, savedTracks]);

  const modal = useDisclosure();

  const allTracks: (TrackWithTags | null | undefined)[] = useMemo(() =>
      [...tracksWithTags, ...new Array(totalNumTracks).fill(null)]
    , [tracksWithTags, totalNumTracks]);

  const isRowLoaded = useMemo(() =>
      allTracks.map((_, index) =>
        index < (savedTracksQuery.data?.pages.length ?? 0) * PAGE_SIZE)
    , [allTracks, savedTracksQuery.data?.pages.length]);

  const parentRef = useRef<HTMLDivElement>(null);
  const parentOffsetRef = useRef(0);
  useLayoutEffect(() => {
    parentOffsetRef.current = parentRef.current?.offsetTop ?? 0;
  }, [userProfileQuery.status]);

  const rowVirtualizer = useWindowVirtualizer({
    count: allTracks.length,
    estimateSize: () => 57,
    overscan: 75,
    scrollMargin: parentOffsetRef.current
  });

  const paddingTop =
    rowVirtualizer.getVirtualItems().length > 0
      ? rowVirtualizer.getVirtualItems()?.[0]?.start || 0
      : 0;
  const paddingBottom =
    rowVirtualizer.getVirtualItems().length > 0
      ? rowVirtualizer.getTotalSize() -
      (rowVirtualizer.getVirtualItems()?.[
      rowVirtualizer.getVirtualItems().length - 1
        ]?.end || 0)
      : 0;

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= isRowLoaded.lastIndexOf(true) - 1 &&
      savedTracksQuery.hasNextPage &&
      !savedTracksQuery.isFetchingNextPage
    ) {
      savedTracksQuery.fetchNextPage();
    }
  }, [rowVirtualizer, isRowLoaded, savedTracksQuery]);

  return (
    <>
      <Heading fontSize='3xl' fontWeight='semibold' pb='25px'>Library</Heading>

      {userProfileQuery.isLoading ? (
        <Center>
          <Spinner color='green.300' thickness='4px' speed='0.65s' size='xl' />
        </Center>
      ) : (
        <>
          <CreateTagModal isOpen={modal.isOpen} onCreate={createTag} onClose={modal.onClose} />

          <TagsContext.Provider value={Array.from(tags.values()).filter(x => x !== undefined) as Tag[]}>
            <OpenModalContext.Provider value={modal.onOpen}>
              <TrackTable
                tracks={allTracks}
                addTagToTrack={addTagToTrack}
                removeTagFromTrack={removeTagFromTrack}
                editable={true}
                isRowLoaded={isRowLoaded}
                paddingTop={paddingTop}
                paddingBottom={paddingBottom}
                scrollMargin={rowVirtualizer.options.scrollMargin}
                rowIndicesToRender={rowVirtualizer
                  .getVirtualItems()
                  .map(item => item.index)}
                parentRef={parentRef}
              />
            </OpenModalContext.Provider>
          </TagsContext.Provider>
        </>
      )}
    </>
  );
}
