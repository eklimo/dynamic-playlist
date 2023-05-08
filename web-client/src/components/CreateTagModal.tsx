import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  Button,
  Center,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack
} from '@chakra-ui/react';
import { NormalTag } from './TrackTag';
import { Tag } from '../model';
import colors from '../colors';

const placeholder = 'Name';

const ColorCircle = memo(({ colorType, onClick }: { colorType: number, onClick: () => void }) => {
  const color = colors.get(colorType);
  return (
    <Icon className='color-circle' viewBox='0 0 200 200' boxSize={8} color={`${color}.500`} onClick={onClick}>
      <path
        fill='currentColor'
        d='M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0'
      />
    </Icon>
  );
});

const CreateTagModal = memo(({ isOpen, onCreate, onClose }: {
  isOpen: boolean,
  onCreate: (name: string, color: number) => void,
  onClose: () => void
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(1);

  const previewTag: Tag = useMemo(() => ({
      tagID: 0,
      name: name || placeholder,
      description: '',
      color,
      userID: '',
      tracks: []
    }),
    [name, color]);

  const _onCreate = useCallback(() => {
    onCreate(name, color);
    setName('');
    setColor(1);
    onClose();
  }, [onCreate, onClose, name, color]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Tag</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing='10px'>
              <Center>
                <NormalTag tag={previewTag} />
              </Center>
              <Input placeholder={placeholder} value={name} onChange={e => setName(e.target.value)} />
              <Center>
                {Array.from(colors.keys()).map(color => (
                  <ColorCircle key={color} colorType={color} onClick={() => setColor(color)} />
                ))}
              </Center>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={_onCreate}>Create</Button>
            <Button variant='ghost' onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

export default CreateTagModal;
