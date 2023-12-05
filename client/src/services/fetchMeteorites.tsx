import { FetchParams, MeteoriteResponse } from '../types'

// This could be an environment variable
const API_URL = 'http://localhost:3000';

export const fetchMeteorites = ({ pageParam, mass, year }: FetchParams): Promise<MeteoriteResponse> => {
  let query = `page=${pageParam}&limit=100`
  
  if(!!mass) query += `&mass=${mass}`
  if(!!year) query += `&year=${year}`
  
  return fetch(`${API_URL}/meteorites?${query}`)
    .then((res) => res.json())
}