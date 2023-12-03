import db from './knexInstance';
import fs from 'fs';

export enum FilterType { YEAR = 'year' } // In the future we can add more types

interface Filter {
  field: string,
  operator?: string,
  type?: FilterType
}
interface Accumulator {
  sqls: string[];
  values: string[];
  filter: { [key: string]: string };
}

// Get filters from query string
export const getFiltersFromQuery = (
  query: string, // Query string from url
  filters: Array<Filter> // Filters to apply
): [string, string[], { [key: string]: string }] => {
  
  const queryMap: Map<string, string> = new Map(Object.entries(query))

  const where = filters.reduce<Accumulator>((acc, { field, operator = '=', type = null }) => {
    if (queryMap.has(field)) {
      const sql = parseQueryFilter(field, operator, type);
      acc.sqls.push(sql);
      acc.values.push(queryMap.get(field) || '');
      acc.filter[field] = queryMap.get(field) || '';
    }

    return acc;
  }, { sqls: [], values: [], filter: {} });

  return [where.sqls.join(' AND '), where.values, where.filter]
}


const parseQueryFilter = (field: string, operator: string, type: FilterType | null): string =>  {
  let sql: string = ''
  
  switch (type) {
    case FilterType.YEAR:
      sql = `strftime('%Y', ${field}) ${operator} ?`
      break;
    default:
      sql = `${field} ${operator} ?`
  }

  return sql;
}

export const checkDatabaseStatus = async () => {
  console.log('Checking if table "meteorites" exists...')

  return db.select('name')
    .from('sqlite_master')
    .where('type', 'table')
    .andWhere('name', 'meteorites')
    .then((tables: any) => {
      if(!tables.length) {
        console.log('Table "meteorites" doesn\'t exists. Creating table...')
        return createMeteoritesTable()
      }
    })
    .then(() => {
      console.log('Checking if table "meteorites" has data...')

      return db.select('id')
        .from('meteorites')
        .limit(1)
    })
    .then((meteorites: any) => {
      if(!meteorites.length) {
        console.log('Table "meteorites" is empty. Populating table meteorites...')

        // Get data from file
        return readFile('./meteorites.json')
          .then((ms: any[]) => {
            // Insert data in chunks since SQLite doesn't support bulk insert
            const insertPromises = [];
            const chunkSize = 100;
            for (let i = 0; i < ms.length; i += chunkSize) {
              const from = i;
              const to = i + chunkSize;
              const chunk = ms.slice(from, to);

              insertPromises.push(db('meteorites')
                .insert(chunk)
                .then(() => {
                  console.log(`${to} of ${ms.length}.`)
                })
              )
            }

            return Promise.all(insertPromises)
          });
      }
    })
    .catch((err: any) => {
      console.log(err)
    })
    .finally(() => {
      console.log('Database ready!')
    });
}

const createMeteoritesTable = async () => {
  return db
    .schema
    .createTable('meteorites', (table: any) => {
      table.integer('id');
      table.string('name');
      table.string('nametype');
      table.string('recclass');
      table.float('mass');
      table.string('fall');
      table.date('year');
      table.decimal('reclat');
      table.decimal('reclong');
      table.json('geolocation');
    })
}

const readFile = async (fileName: fs.PathOrFileDescriptor) => {
  return new Promise<any>((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (err: any, data: any) => {
      if (err) {
        reject(`Error reading the file: ${err}`)
        return;
      }
  
      try {
        const ms = JSON.parse(data).map((m: any) => {
          // Remove weird fields
          const { name, id, nametype, recclass, mass, fall, year, reclat, reclong, geolocation } = m
          return { name, id, nametype, recclass, mass, fall, year, reclat, reclong, geolocation }
        });

        resolve(ms) 
      } catch (err) {
        reject(`Error parsing JSON: ${err}`)
      }
    });
  })
}