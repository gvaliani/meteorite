import express from 'express';
import { checkDataStatus } from './helpers/database';
import router from './modules/routes';
import middleware from './modules/middleware';

// This could be an environment variable
const PORT = 3000

const app = express()

// Set Middlewares
middleware(app)

// Set routes
router(app)

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)

  // Check status of data source like databases, memory, files, etc
  checkDataStatus()
})