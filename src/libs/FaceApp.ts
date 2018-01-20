/**
 * Forked from https://github.com/lolPants/faceapp.js
 */
import * as FormData from 'form-data'
import * as superagent from 'superagent'

/**
 * Filter interface
 */
interface Filter {
  id: string
  title: string
  cropped: boolean
  paid?: boolean
}

/**
 * Avaliable filters response interface
 */
interface AvailableFiltersResponse {
  code: string
  deviceID: string
  filters: Filter[]
}

/**
 * Faceapp class with functonal for photo processing
 */
export default class FaceApp {
  /**
   * Test photo for request filters
   */
  private static TEST_IMAGE_URL = 'https://i.imgur.com/nVsxMNp.jpg'

  /**
   * Useragent for creating request
   */
  private static API_USER_AGENT = 'FaceApp/2.0.561 (Linux; Android 6.0)'

  /**
   * Request url
   */
  private baseUrl: string

  /**
   * Generate a random Device ID
   * @returns {string}
   */
 private static generateDeviceID() {
    const length: number = 15
    return Array(length)
      .fill(0)
      .map(() => String.fromCharCode(Math.random() * 25 + 97 | 0))
      .join('')
  }

  /**
   * @constructor
   * @param {number} version API version
   */
  public constructor(public version: number = 2.6) {
    this.baseUrl = `https://node-03.faceapp.io/api/v${version}/photos`
  }

  /**
   * Runs an photo through the [FaceApp](https://www.faceapp.com/) algorithm
   * @param {Buffer} path Path to Image OR Image Buffer
   * @param {string} [filterID] Filter ID
   * @return {Promise<Buffer>}
   */
  public async process(path: Buffer, filterID: string): Promise<Buffer> {
    try {
      const arg: AvailableFiltersResponse = await this.getAvailableFilters(path)
      const img: Buffer = await this.getFilterImage(arg, filterID)

      return img
    } catch (err) {
      if (err.status === 400) {
        const code: string = err.response.body.err.code || ''

        // Known error codes
        switch (code) {
          case 'photo_no_faces': {
            throw new Error('No Faces found in Photo')
          }

          case 'bad_filter_id': {
            throw new Error('Invalid Filter ID')
          }

          default: {
            throw new Error(err)
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
  public async listFilters(minimal: true): Promise<string[]>
  public async listFilters(minimal: false): Promise<Filter[]>
  public async listFilters(minimal: boolean = false) {
    const res = await superagent.get(FaceApp.TEST_IMAGE_URL)
    const allFilters = await this.getAvailableFilters(res.body)

    return minimal
      ? allFilters.filters.map(a => a.id)
      : allFilters.filters
  }

  /**
   * @param {Buffer} file Input File
   * @return {Promise<AvailableFiltersResponse>}
   */
  private async getAvailableFilters(file: Buffer): Promise<AvailableFiltersResponse> {
    const deviceID = FaceApp.generateDeviceID()

    const res = await superagent.post(this.baseUrl)
      .set('User-Agent', FaceApp.API_USER_AGENT)
      .set('X-FaceApp-DeviceID', deviceID)
      .attach('file', file, 'image.png')

    const code = res.body.code
    const filters = res.body.filters.map((o: any): Filter => ({
      id: o.id,
      title: o.title,
      cropped: o.is_paid ? true : o.only_cropped,
      paid: o.is_paid,
    }))

    return { code, deviceID, filters }
  }

  /**
   * @param {AvailableFiltersResponse} args Input Object
   * @param {string} filterID Filter ID
   * @return {Promise<Buffer>}
   */
  private async getFilterImage(args: AvailableFiltersResponse, filterID: string = 'no-filter'): Promise<Buffer> {
    // Remove invalid filters
    const filterArr: Filter[] = args.filters.filter(o => o.id === filterID)

    if (filterArr.length === 0) {
      const filters: string = args.filters.map(o => o.id).join(', ')
      throw new Error(`Invalid Filter ID\nAvailable Filters: '${filters}'`)
    }

    const filter: Filter = filterArr[0]
    const cropped: '1' | '0' = filter.cropped ? '1' : '0'
    const url: string = `${this.baseUrl}/${args.code}/filters/${filter.id}?cropped=${cropped}`

    const res = await superagent.get(url)
      .set('User-Agent', FaceApp.API_USER_AGENT)
      .set('X-FaceApp-DeviceID', args.deviceID)

    return res.body
  }
}
