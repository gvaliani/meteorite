import { useState, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useDebounce } from "use-debounce";
import { fetchMeteorites } from '../services/fetchMeteorites';

const useMeteorites = ({ yearFilter, massFilter }: { yearFilter: string, massFilter: string }) => {
  const [queryKey, setQueryKey] = useState(`${yearFilter}-${massFilter}`) 
  const [debouncedQueryKey] = useDebounce(queryKey, 500);

  useEffect(() => {
    setQueryKey(`${yearFilter}-${massFilter}`)
  }, [yearFilter, massFilter])

  return useInfiniteQuery({
    queryKey: ['meteorites', debouncedQueryKey],
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
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
}

export default useMeteorites;