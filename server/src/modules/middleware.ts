import express from 'express';
import CorsMiddleware from '../middlewares/cors'

export default (app: express.Application) => {
  // We can add more middlewares or some logic here
  app.use(CorsMiddleware)
}