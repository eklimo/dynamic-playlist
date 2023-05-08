import { Box, Input, List, ListItem, VStack } from '@chakra-ui/react';
import React, { memo, RefObject, useCallback, useContext, useMemo, useState } from 'react';
import { useCombobox } from 'downshift';
import { Tag } from '../model';
import { NormalTag } from './TrackTag';
import { OpenModalContext } from '../OpenModalContext';
import { TagsContext } from '../TagsContext';

const TagAutocomplete = memo(({ initialFocusRef, selectTag }: {
  initialFocusRef: RefObject<any>,
  selectTag: (tag: Tag) => void
}) => {
  const tags = useContext(TagsContext);
  const sortedTags = useMemo(
    () =>
      tags.sort(
        (a, b) =>
          a.color - b.color || a.name.localeCompare(b.name)
      ),
    [tags]
  );

  const [items, setItems] = useState(sortedTags);

  const [isCreateNewVisible, setIsCreateNewVisible] = useState(false);

  const getFilter = useCallback((rawInput: string) => {
    const input = rawInput.toLowerCase();
    return (item: Tag) => item.name.toLowerCase().includes(input) || item.description?.toLowerCase().includes(input);
  }, []);

  const {
    isOpen,
    getInputProps,
    getMenuProps,
    getItemProps,
    setInputValue,
    highlightedIndex // TODO
  } = useCombobox({
    items,
    onInputValueChange({ inputValue }) {
      const items = sortedTags.filter(inputValue ? getFilter(inputValue!) : (_: Tag) => true);
      setItems(items);

      setIsCreateNewVisible(inputValue !== undefined && items.length === 0);
    },
    onSelectedItemChange: ({ selectedItem }) => selectedItem && selectTag(selectedItem),
    onIsOpenChange: () => {
      setInputValue('');
    },
    itemToString: item => item?.name ?? ''
  });

  const openModal = useContext(OpenModalContext);

  return (
    <Box>
      <Input placeholder='Add a tag' {...getInputProps({ ref: initialFocusRef })} />
      <List className={isOpen && items.length > 0 ? '' : 'hidden'}  {...getMenuProps()}>
        <VStack py='5px' spacing='2px' align={'start'}>
          {isOpen && items.map((item, index) => (
            <ListItem key={item.tagID}  {...getItemProps({ item, index })} style={{
              cursor: 'pointer'
            }}>
              <NormalTag key={item.tagID} tag={item} />
            </ListItem>
          ))}
          {isOpen && isCreateNewVisible && (
            <ListItem onClick={openModal}>
              Create new tag...
            </ListItem>
          )}
        </VStack>
      </List>
    </Box>
  );
});

export default TagAutocomplete;
