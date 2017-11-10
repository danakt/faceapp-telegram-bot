/**
 * Returns array of availabe filters from filter match
 * @param  {string}  filtersMatch  String with filters
 * @param  {?number} limit         Limit of filters
 * @return {Promise<Array<string>>}
 */
export default async function prepareFilters(filtersMatch: string, limit: number = 1): Promise<string[]> {
  const filtersArray = filtersMatch
    .split(' ')
    .map(item => item.slice().toLowerCase())
    .filter(Boolean)
    .slice(0, limit)

  return filtersArray
}
