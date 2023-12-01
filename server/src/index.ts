import express from 'express';
import { checkDatabaseStatus } from './modules/dataBaseUtils';

const app = express()
const port = 3000

app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}); 

app.get('/', (req: any, res: any) => {
  res.send('Hello World 9!')
})

app.listen(port, () => {
  console.log(`Server started on port ${port}`)

  // Check database
  checkDatabaseStatus()
})