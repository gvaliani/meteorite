import MeteoritesController from '../controllers/meteorites'
import express from 'express';
import { sanitazeInteger } from '../helpers/sanitazers';

export default (app: express.Application) => {
  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  // Get meteorites
  app.get('/meteorites', async (req, res) => {
    // Sanitize query params
    let limit = sanitazeInteger(req?.query?.limit) || 20;
    let page = sanitazeInteger(req?.query?.page) || 1;
    let year = sanitazeInteger(req?.query?.year);
    let mass = sanitazeInteger(req?.query?.mass);

    const {totalPages, total, filter, filterHasChanged, data} = await MeteoritesController.getMeteorites(page, limit, { year, mass })

    res.send({
      totalPages,
      total,
      filter,
      filterHasChanged,
      data
    })
  })
}