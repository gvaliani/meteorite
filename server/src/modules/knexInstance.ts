import { knex } from 'knex';

export default knex({
  client: 'sqlite3',
  connection: {
    filename: "./mydb.sqlite"
  },
  useNullAsDefault: true
});