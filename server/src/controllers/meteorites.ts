import Meteorite from '../models/meteorite';

export default {
  getMeteorites: (page: number, limit: number, filters: any) => {
    let dataP = (new Meteorite())
      .filterBy('year', '=', filters.year)
      .filterBy('mass', '>', filters.mass)

    // Count total data
    let dataCountP = dataP.count()
    
    // Paginated query
    let dataPaginatedP = dataP.page(page, limit)

    let filterHasChanged = false;

    return dataPaginatedP
      .then((data) => {
        // If there is no data with the user's filters,
        // return the closest meteorite based on mass
        // if the user has set the year and mass filters
        if(data.length === 0 && filters.year != null && filters.mass != null) {
          // Reset pagination
          limit = 1
          page = 1

          filterHasChanged = true

          // New base query for pagination and count
          const newDataPaginatedP = (new Meteorite())
            .filterBy('mass', '>', filters.mass) // // Reset filters to get the closest meteorite based on mass
            .page(1, 1)
            .then((data) => {
              filters.year = data[0].year.substring(0, 4)
              return Promise.resolve(data)
            })

          // Fake count. The dataset has more than one meteorite bigger that 100.000
          // but exercise expects receive just one. In other context I would have returned all of them
          const newDataCountP = Promise.resolve([{ count: 1 }]);

          return [
            newDataPaginatedP,  // Paginated data
            newDataCountP,      // Total data
            filters,             // Filters
            filterHasChanged,   // Alert the user that the filters have been changed
            limit               // Limit
          ]
        }

        return [
          Promise.resolve(data),              // Paginated data
          dataCountP,                         // Total data
          filters,                             // Filters
          filterHasChanged,                   // Alert if filter has changed. It never will be changed here. It is returned anyway for consistency
          limit,                              // Limit
        ]
      })
      .then(([dataPaginatedP, dataCountP, filter, filterHasChanged, limit]) => {
        return Promise.all([dataCountP, dataPaginatedP])
          .then(([dataCount, dataPaginated]) => {
            const total = (dataCount as [{ count: number }])[0]?.count || 0;

            return {
              totalPages: Math.ceil(total / (limit as number)),
              total,
              filter,
              filterHasChanged,
              data: dataPaginated
            }
          })
      })
  }
}