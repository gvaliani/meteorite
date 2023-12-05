// Type definitions could be grouped in multiple files based on their context.
// For this example we will keep them in one file.

export enum FilterType { YEAR = 'year' } // In the future we can add more types

export type MeteoriteFileItem = {
  id: number,
  name: string,
  nametype: string,
  recclass: string,
  mass: number,
  fall: string,
  year: string,
  reclat: number,
  reclong: number,
  geolocation: string
}