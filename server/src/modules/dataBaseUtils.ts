const { knexInstance: db } = require('./knexInstance');
const fs = require('fs');

export const checkDatabaseStatus = async () => {
  console.log('Checking if table "meteorites" exists...')

  return db.select('name')
    .from('sqlite_master')
    .where('type', 'table')
    .andWhere('name', 'meteorites')
    .then((tables: [String]) => {
      if(!tables.length) {
        console.log('Table "meteorites" doesn\'t exists. Creating table...')
        return createMeteoritesTable()
      }
    })
    .then(() => {
      console.log('Checking if table "meteorites" has data...')

      db.select('id')
        .from('meteorites')
        .limit(1)
        .then((meteorites: [String]) => {
          if(!meteorites.length) {
            console.log('Table "meteorites" is empty. Populating table...')

            // Get data from file
            return readFile('./meteorites.json')
              .then((ms: any[]) => {

                // Insert data in chunks since SQLite doesn't support bulk insert
                const chunkSize = 100;
                for (let i = 0; i < ms.length; i += chunkSize) {
                  const chunk = ms.slice(i, i + chunkSize);

                  db('meteorites')
                    .insert(chunk)
                    .then(() => {
                      console.log('Table "meteorites" populated successfully.')
                    })
                    .catch((err: any) => {
                      console.log(err)
                    });
                }
              })
              .catch((err: any) => {
                console.log(err)
              });
          }
        })
    })
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

const readFile = async (fileName: String) => {
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