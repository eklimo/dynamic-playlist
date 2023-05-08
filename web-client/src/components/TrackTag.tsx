import { Tag as TagComponent, TagCloseButton, TagLabel } from '@chakra-ui/react';
import { memo } from 'react';
import { Tag } from '../model';

const colors = ['red', 'orange', 'yellow', 'green', 'teal', 'cyan', 'blue', 'purple', 'pink'];

interface RemoveableTagProps {
  tag: Tag;
  onRemove: (tag: Tag) => void;
}

export const RemoveableTag = memo(({ tag, onRemove }: RemoveableTagProps) => {
  return (
    <TagComponent
      className='tag'
      size='md'
      borderRadius='xl'
      variant='solid'
      colorScheme={colors[tag.color]}
    >
      <TagLabel className='tag-label'>{tag.name}</TagLabel>
      <TagCloseButton className='tag-close' onClick={() => onRemove(tag)} />
    </TagComponent>
  );
});
