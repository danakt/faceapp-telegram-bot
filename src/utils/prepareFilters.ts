import * as faceapp from 'faceapp'

/**
 * Returns array of availabe filters from filter match
 * @param  {string}  filtersMatch  String with filters
 * @param  {?number} limit         Limit of filters
 * @return {Promise<Array<string>>}
 */
export default async function prepareFilters(filtersMatch: string, limit: number = 1): Promise<string[]> {
  const availableFilters: string[] = await faceapp.listFilters(true)
  const filtersArray = filtersMatch
    .split(' ')
    .filter(item => availableFilters.includes(item))
    .map(item => item.slice().toLowerCase())
    .slice(0, limit)

  return filtersArray
}