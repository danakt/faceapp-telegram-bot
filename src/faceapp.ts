/**
 * Forked from https://github.com/lolPants/faceapp.js
 */
import * as FormData        from 'form-data'
import * as superagent      from 'superagent'

const TEST_IMAGE_URL = 'https://i.imgur.com/nVsxMNp.jpg'
const API_BASE_URL   = 'https://node-03.faceapp.io'
const API_USER_AGENT = 'FaceApp/2.0.561 (Linux; Android 6.0)'

interface Filter {
  id:       string
  title:    string
  cropped:  boolean
}

interface AvailableFilters {
  code:     string
  deviceID: string
  filters:  Filter[]
}

/**
 * Generate a random Device ID
 * @returns {string}
 */
function generateDeviceID() {
  const length: number = 15
  return Array(length)
    .fill(0)
    .map(() => String.fromCharCode(Math.random() * 25 + 97 | 0))
    .join('')
}

/**
 * @param  {Buffer} file Input File
 * @return {Promise<AvailableFilters>}
 */
async function getAvailableFilters(file: Buffer): Promise<AvailableFilters> {
  const deviceID = generateDeviceID()

  const res = await superagent.post(`${API_BASE_URL}/api/v2.6/photos`)
    .set('User-Agent', API_USER_AGENT)
    .set('X-FaceApp-DeviceID', deviceID)
    .attach('file', file, 'image.png')

  const code = res.body.code
  const filters = res.body.filters
    .map(o => ({
      id: o.id,
      title: o.title,
      cropped: o.is_paid ? true : o.only_cropped,
      paid: o.is_paid,
    }))

  return { code, deviceID, filters }
}

/**
 * @param  {AvailableFilters} args      Input Object
 * @param  {string}           filterID  Filter ID
 * @return {Promise<Buffer>}
 */
async function getFilterImage(args: AvailableFilters, filterID: string = 'no-filter'): Promise<Buffer> {
  // Remove invalid filters
  const filterArr: Filter[] = args.filters.filter(o => o.id === filterID)

  if (filterArr.length === 0) {
    const filters: string = args.filters.map(o => o.id).join(', ')
    throw new Error(`Invalid Filter ID\nAvailable Filters: '${filters}'`)
  }

  const filter: Filter = filterArr[0]
  const cropped: '1' | '0' = filter.cropped ? '1' : '0'
  const url: string = `${API_BASE_URL}/api/v2.6/photos/${args.code}/filters/${filter.id}?cropped=${cropped}`

  const res = await superagent.get(url)
    .set('User-Agent', API_USER_AGENT)
    .set('X-FaceApp-DeviceID', args.deviceID)

  return res.body
}

/**
 * Runs an image through the [FaceApp](https://www.faceapp.com/) algorithm
 * @param  {Buffer} path       Path to Image OR Image Buffer
 * @param  {string} [filterID] Filter ID
 * @return {Promise<Buffer>}
 */
export async function process(path: Buffer, filterID: string): Promise<Buffer> {
  try {
    const arg: AvailableFilters = await getAvailableFilters(path)
    const img: Buffer = await getFilterImage(arg, filterID)

    return img
  } catch (err) {
    if (err.status === 400) {
      const code: string = err.response.body.err.code || ''

      // Known Error Codes
      switch (code) {
        case 'photo_no_faces': {
          throw new Error('No Faces found in Photo')
        }

        case 'bad_filter_id': {
          throw new Error('Invalid Filter ID')
        }

        default: {
          throw err
        }
      }
    } else {
      throw err
    }
  }
}

/**
 * Lists all available filters
 * @param {boolean} [minimal=false] Whether to only return an array of filter IDs (no extra metadata)
 * @returns {Promise<Filter[]>|Promise<string[]>}
 */
export const listFilters = async (minimal = false) => {
  const res = await superagent.get(TEST_IMAGE_URL)
  const allFilters = await getAvailableFilters(res.body)

  return minimal
    ? allFilters.filters.map(a => a.id)
    : allFilters.filters
}
