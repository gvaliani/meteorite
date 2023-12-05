export type Meteorite = {
  id: string;
  name: string;
  mass: number;
  year: string;
}

export type FetchParams = {
  pageParam: number;
  mass: string;
  year: string;
};

export type MeteoriteResponse = {
  data: Meteorite[],
  total: number,
  totalPages: number,
  filter: { year?: string, mass?: string },
  filterHasChanged: boolean
};