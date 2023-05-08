import { Tag as TagComponent, TagCloseButton, TagLabel } from '@chakra-ui/react';
import { memo } from 'react';
import { Tag } from '../model';
import colors from '../colors';

interface NormalTagProps {
  tag: Tag;
}

export const NormalTag = memo(({ tag }: NormalTagProps) => {
  const color = colors.get(tag.color);
  return (
    <TagComponent size='md' borderRadius='xl' variant='solid' colorScheme={color}>
      <TagLabel>{tag.name}</TagLabel>
    </TagComponent>
  );
});


interface RemoveableTagProps {
  tag: Tag;
  onRemove: (tag: Tag) => void;
}

export const RemoveableTag = memo(({ tag, onRemove }: RemoveableTagProps) => {
  const color = colors.get(tag.color);
  return (
    <TagComponent className='removeable-tag' size='md' borderRadius='xl' variant='solid' colorScheme={color}>
      <TagLabel className='removeable-tag-label'>{tag.name}</TagLabel>
      <TagCloseButton className='tag-close' onClick={() => onRemove(tag)} />
    </TagComponent>
  );
});
