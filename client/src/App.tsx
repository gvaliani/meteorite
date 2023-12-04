import { useState, useEffect } from 'react'
import './App.css'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useDebounce } from "use-debounce";
import AppInfiniteList from './AppInfiniteList';
import MeteoriteItem from './AppMeteoriteItem';
import { Meteorite } from './types'

type FetchParams = {
  pageParam: number;
  mass: string;
  year: string;
};

type MeteoriteResponse = {
  data: Meteorite[],
  total: number,
  totalPages: number,
  filter: { year?: string, mass?: string },
  filterHasChanged: boolean
};

const fetchMeteorites = ({ pageParam, mass, year }: FetchParams): Promise<MeteoriteResponse> => {
  let query = `page=${pageParam}&limit=100`
  
  if(!!mass) query += `&mass=${mass}`
  if(!!year) query += `&year=${year}`
  
  return fetch(`http://localhost:3000/meteorites?${query}`)
    .then((res) => res.json())
}

function App() {
  const [yearFilter, setYearFilter] = useState('');
  const [massFilter, setMassFilter] = useState(''); 

  const [queryKey, setQueryKey] = useState(`${yearFilter}-${massFilter}`) 
  const [debouncedQueryKey] = useDebounce(queryKey, 500);
  
  // Update query key when filters change
  useEffect(() => {
    setQueryKey(`${yearFilter}-${massFilter}`)
  }, [yearFilter, massFilter])

  // Alert message if filter has changed from server
  const messageAlert = (newFilter) => {
    const nf = Object.entries(newFilter)
      .reduce((acc: string[], [field, value]) => {
        acc.push(`${field}: ${value}`)

        return acc
      }, [])

    return (
      <div className='warning'>
        <div>Since there were no results for the selected filters, the search was changed to return the closest meteorite.</div>
        <div>New filter applied: {nf.join(', ')}</div>
      </div>
    )
  }

  const {
    data: response,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['meteorites', debouncedQueryKey],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: ({ pageParam }) => {
      return fetchMeteorites({ pageParam, mass: massFilter, year: yearFilter })
        .then(({ data, total, totalPages, filter, filterHasChanged }) => {
          let nextPage = pageParam + 1

          return {
            data: data,
            nextPage: totalPages >= nextPage ? nextPage : null,
            meta: { total, filter, filterHasChanged }
          }
        })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage
    },
  })

  const meta = !!response ? response.pages[0]?.meta : null
  const meteorites = !!response ? response.pages.flatMap((p) => p.data) : []
  const totalItems = meta?.total || 0
  const filterHasChanged = meta?.filterHasChanged
  const filter = meta?.filter

  return (
    <>
      <h1>Meteorites</h1>
      <div style={{ display: 'flex' }}>
        <div
          className="form-group"
          style={{ marginRight: '10px' }}
        >
          <label>Mass:</label>
          <input
            className='form-control'
            type="number"
            value={massFilter}
            onChange={(e) => { setMassFilter(e.target.value) }}
          />
        </div>

        <div className="form-group">
          <label>Year:</label>
          <input
            className='form-control'
            type="number"
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value) }}
          />
        </div>
      </div>

      {/* Total items */}
      { <div className='text-muted'>Total items found: {totalItems}</div> }

      {/*  Alert message if filter has changed from server */}
      { filterHasChanged && messageAlert(filter) }

      {/* No data found */}
      { !isFetching && meteorites.length == 0 && <div>No meteorites were found</div> }

      {/* Loading */}
      { isFetching && !isFetchingNextPage && <div>Loading Meteorites...</div> }
      
      <AppInfiniteList
        items={meteorites}
        ItemTemplate={MeteoriteItem}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        queryKey={debouncedQueryKey}
      />
    </>
  )
}

export default App
