import React, { memo, useCallback, useEffect, useState } from 'react';
import { Tag } from '../model';
import { FilterableTag, FilterState } from './TrackTag';
import { HStack, Text } from '@chakra-ui/react';

interface FilterableTagGroupProps {
  tags: Tag[];
  onStateChange: (include: Tag[], exclude: Tag[]) => void;
}

export const FilterableTagGroup = memo(({ tags, onStateChange }: FilterableTagGroupProps) => {
  const [include, setInclude] = useState([] as Tag[]);
  const [exclude, setExclude] = useState([] as Tag[]);

  const _onStateChange = useCallback((tag: Tag, prevState: FilterState, state: FilterState) => {
    switch (state) {
      case FilterState.Include:
        setInclude(prev => [...prev, tag]);
        break;
      case FilterState.Exclude:
        setExclude(prev => [...prev, tag]);
        break;
    }

    switch (prevState) {
      case FilterState.Include:
        setInclude(prev => prev.filter(t => t !== tag));
        break;
      case FilterState.Exclude:
        setExclude(prev => prev.filter(t => t !== tag));
        break;
    }
  }, []);

  useEffect(() => {
    onStateChange(include, exclude);
  }, [onStateChange, include, exclude]);

  return (
    <HStack spacing='8px'>
      {tags.length > 0 ? tags.map(tag => (
        <FilterableTag key={tag.tagID} tag={tag} onStateChange={_onStateChange} />
      )) : (
        <Text>No tags</Text>
      )}
    </HStack>
  );
});
