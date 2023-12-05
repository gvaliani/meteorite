import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import './AppInfiniteList.css';

interface AppListProps {
  items: any[];
  ItemTemplate?: any;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  resetScroll?: boolean;
  queryKey?: string;
}

// Since every time the query changes, the scroll position is reset, we need to save it somewhere
let scrollTop = 0;
let previousQueryKey = '';

function AppInfiniteList({ items, ItemTemplate, hasNextPage = false, fetchNextPage, isFetchingNextPage, queryKey }: AppListProps) {
  // The scrollable element
  const scrollEl = useRef()

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? items.length + 1 : items.length,
    getScrollElement: () => scrollEl.current,
    estimateSize: () => 94,
    overscan: 5,
  })

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems().reverse()]

    if (!lastItem) {
      return
    }

    if (
      lastItem.index >= items.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [
    hasNextPage,
    fetchNextPage,
    items.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ])
  
  // Save the scroll position
  useEffect(() => {
    const handleScroll = (e) => {
      // Save scroll position somewhere
      scrollTop = e.target.scrollTop;
    };

    const scrollContainer = scrollEl.current;
    scrollContainer.addEventListener('scroll', handleScroll);

    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore the scroll position
  useEffect(() => {
    const scrollContainer = scrollEl.current;

    // If the query has changed, reset the scroll position
    console.log(previousQueryKey, queryKey)
    // if(previousQueryKey != queryKey) {
    //   previousQueryKey = queryKey
    //   scrollTop = 0
    // }
    
    // Restore scroll position
    scrollContainer.scrollTop = scrollTop;
  }, []);

  return (
    <div
      ref={scrollEl}
      className='infinite-list'
    >
      <ul
        className='infinite-list-ul'
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index > items.length - 1
          const item = items[virtualRow.index]

          return (
            <li
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              { isLoaderRow
                  ? (<div className='infinite-list-more'>Loading more...</div>)
                  : (<ItemTemplate item={item} />)
              }
            </li>
          )
        })}
      </ul>
    </div>
  );
}

export default AppInfiniteList;
