import db from '../modules/knexInstance';
import { readFile } from '../helpers/filesystem';
import { FilterType, MeteoriteFileItem } from '../types';

// This could be an environment variable
const DATA_SET = './meteorites.json';

export const makeWhere = (field: string, operator: string, value: string | number, type: FilterType | null) => {
  const sql = parseQueryFilter(field, operator, type)
  return sql;
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

export const checkDataStatus = async () => {
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
        return readFile(DATA_SET)
          .then((data: any) => {
            return JSON.parse(data).map((m: MeteoriteFileItem) => {
              // Remove weird fields
              const { name, id, nametype, recclass, mass, fall, year, reclat, reclong, geolocation } = m
              return { name, id, nametype, recclass, mass, fall, year, reclat, reclong, geolocation }
            });
          })
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
    .createTable('meteorites', (table) => {
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