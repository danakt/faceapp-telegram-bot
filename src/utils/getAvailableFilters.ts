import { listFilters } from '../faceapp'

/**
 * Return available filters
 * @return {Promise<Array<string>>}
 */
export default function getAvailableFilters(): Promise<string[]> {
  return listFilters(true)
}
