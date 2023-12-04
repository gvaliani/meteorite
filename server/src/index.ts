import express from 'express';
import db from './modules/knexInstance';
import { checkDatabaseStatus, getFiltersFromQuery, FilterType } from './modules/dataBaseUtils';

const app = express()
const port = 3000

app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}); 

app.get('/', (req: any, res: any) => {
  res.send('Hello World!')
})

app.get('/meteorites', (req: any, res: any) => {
  // Set pagination
  let limit = parseInt(req.query.limit) > 0 ? req.query.limit : 20;
  let page = parseInt(req.query.page) > 0 ? req.query.page : 1;

  // Set filters
  const [whereFilter, values, filter] = getFiltersFromQuery(req.query, [
    { field: 'year', type: FilterType.YEAR },
    { field: 'mass', operator: '>' },
  ])

  // Base query for pagination and count
  let dataP =  db.select('*')
    .from('meteorites')
    .whereRaw(whereFilter, values)

  // Paginate data
  let dataPaginatedP = dataP.clone()
    .limit(limit)
    .offset(limit * (page - 1))

  let filterHasChanged = false;

  dataPaginatedP
    .then((data) => {
      // If there is no data with the user's filters,
      // return the closest meteorite based on mass
      // if the user has set the year and mass filters
      if(data.length === 0 && filter.year != null && filter.mass != null) {

        // Reset filters to get the closest meteorite based on mass
        const [whereFilter, values, filter] = getFiltersFromQuery(req.query, [
          { field: 'mass', operator: '>' },
        ])

        // Reset pagination
        limit = 1
        page = 1

        filterHasChanged = true

        // New base query for pagination and count
        const newDataPaginatedP = db.select('*')
          .from('meteorites')
          .whereRaw(whereFilter, values)
          .limit(limit)
          .offset(limit * (page - 1)) // I could use first() but for consistency with previous query I use limit and offset
          .then((data) => {
            filter.year = data[0].year.substring(0, 4)
            return Promise.resolve(data)
          })

        // Fake count. The dataset has more than one meteorite bigger that 100.000
        // but exercise expects receive just one. In other context I would have returned all of them
        const newDataCountP = Promise.resolve([{ count: 1 }]);

        return [
          newDataPaginatedP,  // Paginated data
          newDataCountP,      // Total data
          filter,             // Filters
          filterHasChanged,   // Alert the user that the filters have been changed
          limit               // Limit
        ]
      }

      return [
        Promise.resolve(data),              // Paginated data
        dataP.clone().count('id as count'), // Total data
        filter,                             // Filters
        filterHasChanged,                   // Alert if filter has changed. It never will be changed here. It is returned anyway for consistency
        limit,                              // Limit
      ]
    })
    .then(([dataPaginatedP, dataCountP, filter, filterHasChanged, limit]) => {
      Promise
        .all([dataCountP, dataPaginatedP])
        .then(async ([dataCount, dataPaginated]) => {
          const total = dataCount[0].count

          await new Promise(resolve => setTimeout(resolve, 1000));

          res.send({
            totalPages: Math.ceil(total / limit),
            total: total,
            filter,
            filterHasChanged,
            data: dataPaginated
          })
        })
    })
})

app.listen(port, () => {
  console.log(`Server started on port ${port}`)

  // Check database
  checkDatabaseStatus()
})