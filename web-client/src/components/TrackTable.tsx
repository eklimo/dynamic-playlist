import React, { memo, RefObject, useMemo, useRef } from 'react';
import {
  HStack,
  IconButton,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  WrapItem
} from '@chakra-ui/react';
import { Cell, createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Album, Tag, Track } from '../model';
import { AddIcon } from '@chakra-ui/icons';
import { RemoveableTag } from './TrackTag';
import TagAutocomplete from './TagAutocomplete';

type RowType = {
  index: number
  main: TrackWithTags
  album: Album
  tags: TrackWithTags
}
const columnHelper = createColumnHelper<RowType>();

const trackToRow = (track: TrackWithTags, index: number): RowType => ({
  index,
  main: track,
  album: track.album,
  tags: track
});

export interface TrackWithTags extends Track {
  tags: Tag[];
}

const IndexCell = memo(({ value }: { value: number }) => (
  <>{value}</>
));

const MainCell = memo(({ track }: { track: TrackWithTags }) => {
  const secondaryTextColor = useColorModeValue('gray.700', 'gray.300');

  return (
    <HStack spacing='12px'>
      <Image
        className='track-image'
        objectFit='cover'
        boxSize='40px'
        src={track.album.image.url}
      />
      <Stack spacing='4px'>
        <Text fontWeight='semibold'>{track.name}</Text>
        <Text textColor={secondaryTextColor}>{track.artists.join(', ')}</Text>
      </Stack>
    </HStack>
  );
});

const AlbumCell = memo(({ album }: { album: Album }) => (
  <>{album.name}</>
));

const TagsCell = memo(({ tags, selectTag, removeTag }: {
  tags: Tag[]
  selectTag: (tag: Tag) => void
  removeTag: (tag: Tag) => void
}) => {
  const sortedTags = useMemo(
    () =>
      tags.sort(
        (a, b) =>
          a.color - b.color || a.name.localeCompare(b.name)
      ),
    [tags]
  );

  const initialFocusRef: RefObject<any> = useRef();

  return (
    <HStack spacing='8px'>
      {sortedTags.map(tag => (
        <RemoveableTag key={tag.tagID} tag={tag} onRemove={removeTag} />
      ))}
      <WrapItem>
        <Popover initialFocusRef={initialFocusRef}>
          <PopoverTrigger>
            <IconButton
              className='add-button'
              aria-label='Add'
              icon={<AddIcon />}
              size='xs'
              variant='ghost'
            />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody p='2px'>
              <TagAutocomplete initialFocusRef={initialFocusRef} selectTag={selectTag} />
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </WrapItem>
    </HStack>
  );
});

interface TrackTableRowProps {
  cells: Cell<RowType, unknown>[];
}

const TrackTableRow = memo(({ cells }: TrackTableRowProps) => {
  const backgroundColor = useColorModeValue(
    {
      backgroundColor: 'gray.50'
    },
    {
      backgroundColor: 'gray.700'
    }
  );

  return (
    <Tr className='table-row' _hover={backgroundColor}>
      {cells.map(cell =>
        (
          <Td key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </Td>
        )
      )}
    </Tr>
  );
});

interface TrackTableProps {
  tracks: TrackWithTags[];
  addTagToTrack: (tag: Tag, trackID: string) => void;
  removeTagFromTrack: (tag: Tag, trackID: string) => void;
}

export default function TrackTable({ tracks, addTagToTrack, removeTagFromTrack }: TrackTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor('index', {
        header: '#',
        cell: props => (
          <IndexCell value={props.getValue() + 1} />
        )
      }),
      columnHelper.accessor('main', {
        header: 'Title',
        cell: props => (
          <MainCell track={props.getValue()} />
        )
      }),
      columnHelper.accessor('album', {
        header: 'Album',
        cell: props => (
          <AlbumCell album={props.getValue()} />
        )
      }),
      columnHelper.accessor('tags', {
        header: 'Tags',
        cell: props => {
          const selectTag = (tag: Tag) => addTagToTrack(tag, props.getValue().id);
          const removeTag = (tag: Tag) => removeTagFromTrack(tag, props.getValue().id);
          return (
            <TagsCell tags={props.getValue().tags} selectTag={selectTag} removeTag={removeTag} />
          );
        }
      })
    ],
    [addTagToTrack, removeTagFromTrack]
  );

  const tableData = useMemo(() => tracks.map(trackToRow), [tracks]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <TableContainer boxShadow='base'>
      <Table size='sm'>
        <Thead>
          {table.getHeaderGroups().map(headerGroup => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <Th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows
            .map(row => (
              <TrackTableRow key={row.id} cells={row.getVisibleCells()} />
            ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
