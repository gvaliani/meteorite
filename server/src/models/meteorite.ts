import db from '../modules/knexInstance';
import { makeWhere } from '../helpers/database';
import { FilterType } from '../types';

export default class Meteorite {
  dataP;
  hasWhereRaw = false;
  
  constructor() {
    this.dataP =  db.select('*').from('meteorites')
  }

  filterBy(field: string, operator: string, value: string | number) {
    if(value) {
      // sqlite for filter by year needs a format like: strftime('%Y', year)
      // This is not the place for this, since it should be agnostic to the database
      // We should be able to change the database engine and every thing should work
      const type = field == 'year' ? FilterType.YEAR : null;

      const sql = makeWhere(field, operator, value, type)

      if(this.hasWhereRaw) {
        this.dataP.andWhereRaw(sql, [value.toString()]) // sqlite needs a string
      } else {
        this.dataP.whereRaw(sql, [value.toString()]) // sqlite needs a string
        this.hasWhereRaw = true
      }
    }

    return this
  }

  page(page: number, limit: number) {
    this.dataP
      .limit(limit)
      .offset(limit * (page - 1));

    return this
  }

  count() {
    return this.dataP.clone().count('id as count')
  }

  then(cb: (value: any[]) => any[] | PromiseLike<any[]>) {
    return this.dataP.then(cb);
  }
}