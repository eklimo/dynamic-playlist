import React, { memo, useCallback } from 'react';
import {
  Button,
  Center,
  Image as ImageComponent,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack
} from '@chakra-ui/react';
import { Image } from '../model';

const PlaylistCreatedModal = memo(({ name, url, image, isOpen, onClose }: {
  name: string,
  url: string,
  image?: Image,
  isOpen: boolean,
  onClose: () => void
}) => {
  const openLink = useCallback(() => {
    window.open(url);
  }, [url]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Playlist</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {url && image ? (
              <Center>
                <VStack spacing='10px'>
                  <ImageComponent w='300px' src={image.url} />
                  <Text>{name}</Text>
                </VStack>
              </Center>
            ) : (
              <Text>Loading</Text>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='whatsapp' mr={3} onClick={openLink}>Open in Spotify</Button>
            <Button variant='ghost' onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

export default PlaylistCreatedModal;
