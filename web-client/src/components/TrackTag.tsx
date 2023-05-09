import { Tag as TagComponent, TagCloseButton, TagLabel } from '@chakra-ui/react';
import { CSSProperties, memo, useCallback, useEffect, useState } from 'react';
import { Tag } from '../model';
import colors from '../colors';

interface NormalTagProps {
  tag: Tag;
}

export const NormalTag = memo(({ tag }: NormalTagProps) => {
  const color = colors.get(tag.color);
  return (
    <TagComponent className='tag' size='md' borderRadius='xl' variant='solid' colorScheme={color}>
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
    <TagComponent className='tag removeable-tag' size='md' borderRadius='xl' variant='solid' colorScheme={color}>
      <TagLabel className='removeable-tag-label'>{tag.name}</TagLabel>
      <TagCloseButton className='tag-close' onClick={() => onRemove(tag)} />
    </TagComponent>
  );
});


export enum FilterState {
  None = 'NONE',
  Include = 'INCLUDE',
  Exclude = 'EXCLUDE',
}

function nextState(state: FilterState) {
  switch (state) {
    case FilterState.None:
      return FilterState.Include;
    case FilterState.Include:
      return FilterState.Exclude;
    case FilterState.Exclude:
      return FilterState.None;
  }
}

function prevState(state: FilterState) {
  return nextState(nextState(state));
}

function stateToVariant(state: FilterState) {
  switch (state) {
    case FilterState.None:
      return 'outline';
    case FilterState.Include:
      return 'subtle';
    case FilterState.Exclude:
      return 'solid';
  }
}

function stateToStyle(state: FilterState): CSSProperties {
  switch (state) {
    case FilterState.Exclude:
      return {
        textDecoration: 'line-through'
      };
    default:
      return {};
  }
}

interface FilterableTagProps {
  tag: Tag,
  onStateChange: (tag: Tag, prevState: FilterState, state: FilterState) => void
}

export const FilterableTag = memo(({ tag, onStateChange }: FilterableTagProps) => {
  const [state, setState] = useState(FilterState.None);
  const color = colors.get(tag.color);

  const onClick = useCallback(() => {
    setState(state => nextState(state));
  }, []);

  useEffect(() => {
    onStateChange(tag, prevState(state), state);
  }, [onStateChange, tag, state]);

  return (
    <TagComponent
      className='tag'
      size='md'
      borderRadius='xl'
      variant={stateToVariant(state)}
      colorScheme={color}
      onClick={onClick}
      style={{
        cursor: 'pointer',
        ...stateToStyle(state)
      }}
    >
      <TagLabel>{tag.name}</TagLabel>
    </TagComponent>
  );
});
