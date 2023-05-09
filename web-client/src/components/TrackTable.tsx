import React, { CSSProperties, memo, RefObject, useMemo, useRef } from 'react';
import {
  HStack,
  IconButton,
  Image,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
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
import { NormalTag, RemoveableTag } from './TrackTag';
import TagAutocomplete from './TagAutocomplete';

const fadeDuration = 0.5;

type ColumnMetaType = {
  isNumeric?: boolean
  style?: CSSProperties
}

const placeholderTag: Tag = {
  tagID: 0,
  userID: '',
  name: 'xxxxxxxxxxxx',
  color: 0,
  tracks: []
};

const placeholderTrack = (id: string): TrackWithTags => ({
  id,
  name: 'xxxxxxxxxxxxxxxxxxxxxx',
  artists: ['xxxxxxxxxxxxxxxxxxxx'],
  album: {
    name: 'xxxxxxxxxxxxxxxxxxxxx',
    image: {
      url: 'https://static.wikia.nocookie.net/ajr-music/images/c/c9/Missing_Album_Art.png',
      width: 0,
      height: 0
    }
  },
  tags: new Array(3).fill(placeholderTag)
});

type RowType = {
  index: null
  main: TrackWithTags
  album: Album
  tags: TrackWithTags
}
const columnHelper = createColumnHelper<RowType>();

const trackToRow = (track: TrackWithTags): RowType => ({
  index: null,
  main: track,
  album: track.album,
  tags: track
});

export interface TrackWithTags extends Track {
  tags: Tag[];
}

const IndexCell = memo(({ value, isLoaded }: { value: number; isLoaded: boolean }) => (
  <Skeleton isLoaded={isLoaded} fadeDuration={fadeDuration} speed={0} style={{
    width: '10%'
  }}>
    {value}
  </Skeleton>
));

const MainCell = memo(({ track, isLoaded }: { track: TrackWithTags; isLoaded: boolean }) => {
  const secondaryTextColor = useColorModeValue('gray.700', 'gray.300');

  return (
    <HStack spacing='12px'>
      <Skeleton isLoaded={isLoaded} fitContent={true} fadeDuration={fadeDuration} speed={0}>
        <Image className='track-image' objectFit='cover' w='40px' minW='40px' src={track.album.image.url} />
      </Skeleton>

      <Stack spacing='4px'>
        <Skeleton isLoaded={isLoaded} fitContent={true} fadeDuration={fadeDuration} speed={0}>
          <Link fontWeight='semibold' href={`http://open.spotify.com/track/${track.id}`} isExternal>{track.name}</Link>
        </Skeleton>
        <Skeleton isLoaded={isLoaded} fitContent={true} fadeDuration={fadeDuration} speed={0}>
          <Text textColor={secondaryTextColor}>{track.artists.join(', ')}</Text>
        </Skeleton>
      </Stack>
    </HStack>
  );
});

const AlbumCell = memo(({ album, isLoaded }: { album: Album; isLoaded: boolean }) => (
  <Skeleton isLoaded={isLoaded} fitContent={true} fadeDuration={fadeDuration} speed={0}>
    {album.name}
  </Skeleton>
));

const TagsCell = memo(({ tags, selectTag, removeTag, editable, isLoaded }: {
  tags: Tag[]
  selectTag: (tag: Tag) => void
  removeTag: (tag: Tag) => void
  editable: boolean
  isLoaded: boolean
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
      {sortedTags.map((tag, index) => editable && isLoaded ? (
        <Skeleton key={index} isLoaded={isLoaded} fitContent={true} fadeDuration={fadeDuration} speed={0}>
          <RemoveableTag key={tag.tagID} tag={tag} onRemove={removeTag} />
        </Skeleton>
      ) : (
        <Skeleton key={index} isLoaded={isLoaded} fitContent={true} fadeDuration={fadeDuration} speed={0}>
          <NormalTag key={tag.tagID} tag={tag} />
        </Skeleton>
      ))}
      {isLoaded && editable &&
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
      }
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
  tracks: (TrackWithTags | null | undefined)[];
  addTagToTrack: (tag: Tag, trackID: string) => void;
  removeTagFromTrack: (tag: Tag, trackID: string) => void;
  editable: boolean;
  isRowLoaded: boolean[];
  paddingTop?: number,
  paddingBottom?: number,
  scrollMargin?: number,
  rowIndicesToRender?: number[],
  parentRef?: RefObject<HTMLDivElement>
}

export default function TrackTable(
  {
    tracks,
    addTagToTrack,
    removeTagFromTrack,
    editable,
    isRowLoaded,
    paddingTop = 0,
    paddingBottom = 0,
    scrollMargin = 0,
    rowIndicesToRender,
    parentRef
  }: TrackTableProps) {

  const columns = useMemo(
    () => [
      columnHelper.accessor('index', {
        header: '#',
        cell: props => (
          <IndexCell value={props.row.index + 1} isLoaded={isRowLoaded[props.row.index]} />
        ),
        meta: {
          style: {
            width: '5%'
          }
        } satisfies ColumnMetaType
      }),
      columnHelper.accessor('main', {
        header: 'Title',
        cell: props => (
          <MainCell track={props.getValue()} isLoaded={isRowLoaded[props.row.index]} />
        ),
        meta: {
          style: {
            width: '30%'
          }
        } satisfies ColumnMetaType
      }),
      columnHelper.accessor('album', {
        header: 'Album',
        cell: props => (
          <AlbumCell album={props.getValue()} isLoaded={isRowLoaded[props.row.index]} />
        ),
        meta: {
          style: {
            width: '20%'
          }
        } satisfies ColumnMetaType
      }),
      columnHelper.accessor('tags', {
        header: 'Tags',
        cell: props => {
          const selectTag = (tag: Tag) => addTagToTrack(tag, props.getValue().id);
          const removeTag = (tag: Tag) => removeTagFromTrack(tag, props.getValue().id);
          return (
            <TagsCell
              tags={props.getValue().tags}
              selectTag={selectTag}
              removeTag={removeTag}
              editable={editable}
              isLoaded={isRowLoaded[props.row.index]}
            />
          );
        },
        meta: {
          style: {
            width: '45%'
          }
        } satisfies ColumnMetaType
      })
    ],
    [addTagToTrack, removeTagFromTrack, editable, isRowLoaded]
  );

  const tableData = useMemo(() =>
      tracks
        .map((track, index) => track ? track : placeholderTrack(String(index)))
        .map(trackToRow)
    , [tracks]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <TableContainer boxShadow='base' ref={parentRef}>
      <Table
        size='sm'
        style={{
          tableLayout: 'fixed',
          position: 'relative',
          transform: `translateY(-${scrollMargin}px)`
        }}
      >
        <Thead
          style={{
            transform: `translateY(${scrollMargin}px)`
          }}
        >
          {table.getHeaderGroups().map(headerGroup => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const meta = header.column.columnDef.meta as ColumnMetaType;
                return (
                  <Th key={header.id} style={meta?.style}>
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
          {paddingTop > 0 && (
            <Tr>
              <Td style={{ height: `${paddingTop}px` }} />
            </Tr>
          )}
          {/*{table.getRowModel().rows*/}
          {/*  .map(row => (*/}
          {/*    <TrackTableRow key={row.id} cells={row.getVisibleCells()} />*/}
          {/*  ))}*/}
          {(rowIndicesToRender
              ? rowIndicesToRender.map(i => table.getRowModel().rows[i])
              : table.getRowModel().rows
          ).map(row => (
            <TrackTableRow key={row.id} cells={row.getVisibleCells()} />
          ))}
          {paddingBottom > 0 && (
            <Tr>
              <Td style={{ height: `${paddingBottom}px` }} />
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
