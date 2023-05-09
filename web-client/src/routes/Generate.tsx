import {
  Button,
  Center,
  Heading,
  HStack,
  Input,
  Select,
  Text,
  useDisclosure,
  useToast,
  UseToastOptions,
  VStack
} from '@chakra-ui/react';
import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import {
  fetchTag,
  fetchTagsForUser,
  fetchUserProfile,
  GeneratePlaylistRequest,
  mutateGeneratePlaylist
} from '../fetch';
import React, { ChangeEvent, useCallback, useContext, useMemo, useState } from 'react';
import { Image, Tag } from '../model';
import FilterMode from '../filterMode';
import { FilterableTagGroup } from '../components/FilterableTagGroup';
import PlaylistCreatedModal from '../components/PlaylistCreatedModal';
import { AuthorizationContext } from '../AuthorizationContext';

const STALE_TIME = 1000 * 60 * 5;

export default function Generate() {
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

  const userProfileQuery = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => fetchUserProfile(authorizationState!.accessToken),
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

  const sortedTags = useMemo(
    () =>
      Array.from(tags.values())
        .filter(x => !!x)
        .map(x => x as Tag)
        .sort(
          (a, b) => a!.color - b!.color || a!.name.localeCompare(b!.name)
        ),
    [tags]
  );

  const [include, setInclude] = useState([] as Tag[]);
  const [exclude, setExclude] = useState([] as Tag[]);
  const [mode, setMode] = useState(FilterMode.All);
  const [name, setName] = useState('');

  const onFiltersChange = useCallback((include: Tag[], exclude: Tag[]) => {
    setInclude(include);
    setExclude(exclude);
  }, []);

  const onModeChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setMode(e.target.value === 'All' ? FilterMode.All : FilterMode.Any);
  }, []);

  const modal = useDisclosure();
  const [playlistURL, setPlaylistURL] = useState('');
  const [playlistImage, setPlaylistImage] = useState(undefined as (Image | undefined));

  const generatePlaylistMutation = useMutation({
    mutationFn: (request: GeneratePlaylistRequest) => mutateGeneratePlaylist(request, authorizationState!.accessToken),
    onSuccess: ({ url, image }, { name }: GeneratePlaylistRequest) => {
      setPlaylistURL(url);
      setPlaylistImage(image);
      modal.onOpen();
    }
  });

  const generatePlaylist = useCallback(() => {
    generatePlaylistMutation.mutate({
      userID: userProfileQuery.data!.id,
      include: include.map(tag => tag.tagID),
      exclude: exclude.map(tag => tag.tagID),
      mode,
      name,
      description: undefined
    });
  }, [generatePlaylistMutation, userProfileQuery.data, name, mode, include, exclude]);

  return (
    <>
      <Heading fontSize='3xl' fontWeight='semibold' pb='25px'>Generate</Heading>

      <PlaylistCreatedModal
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        name={name}
        url={playlistURL}
        image={playlistImage}
      />

      <Center>
        <VStack spacing='20px'>
          <Input w='400px' placeholder='Playlist name' value={name} onChange={e => setName(e.target.value)} />

          <FilterableTagGroup tags={sortedTags} onStateChange={onFiltersChange} />

          <HStack>
            <Text>Match</Text>
            <Select w='110px' onChange={onModeChange}>
              {Object.keys(FilterMode).map(mode => (
                <option key={mode} value={mode}>
                  {mode.toLocaleLowerCase()}
                </option>
              ))}
            </Select>
            <Text>tags</Text>
          </HStack>

          <Button
            colorScheme='twitter'
            onClick={generatePlaylist}
            isDisabled={!name || (include.length === 0 && exclude.length === 0)}
          >
            Generate
          </Button>
        </VStack>
      </Center>
    </>
  );
}
