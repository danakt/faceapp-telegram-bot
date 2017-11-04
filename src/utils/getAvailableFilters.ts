import * as faceapp from 'faceapp'

/**
 * Return available filters
 * @return {Promise<Array<string>>}
 */
export default function getAvailableFilters(): Promise<string[]> {
  return faceapp.listFilters(true)
}
