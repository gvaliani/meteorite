import { useState } from 'react'
import './App.css'
import AppInfiniteList from './components/shared/AppInfiniteList/AppInfiniteList';
import MeteoriteItem from './components/meteorites/AppMeteoriteItem';
import AppMeteoriteFilterAlert from './components/meteorites/AppMeteoriteFilterAlert';
import useMeteorites from './api/useMeteorites';

function App() {
  const [yearFilter, setYearFilter] = useState('');
  const [massFilter, setMassFilter] = useState(''); 

  const {
    data: response,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useMeteorites({yearFilter, massFilter})

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
      { filterHasChanged && filter && <AppMeteoriteFilterAlert filter={filter} /> }

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
      />
    </>
  )
}

export default App
