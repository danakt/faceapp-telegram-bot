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
 * Available filters response interface
 */
interface ProcessResponse {
  code: string
  deviceID: string
  filters: Filter[]
}

/**
 * FaceApp class with functional for photo processing
 */
export default class FaceApp {
  /** Test photo for request filters */
  private static TEST_PHOTO_URL = 'https://i.imgur.com/nVsxMNp.jpg'

  /** Useragent for creating request */
  private static API_USER_AGENT = 'FaceApp/2.0.561 (Linux; Android 6.0)'

  /** Id of available servers */
  private static AVAILABLE_SERVERS = [1, 3, 4]

  /** Index of current server from array above */
  public currentServerInx = 0

  /**
   * Time of updating the filters in memory
   * 1 hour by default
   */
  private static FILTERS_UPDATING_TIME = 36e5

  /** Current FaceApp version */
  private version: number

  /**
   * Buffer of test photo
   * @type {Buffer}
   */
  private testPhotoBuffer?: Buffer

  /** Available filters. Updates every 10 minutes */
  private memoryFilters: Filter[] | null = null

  /** Timestamp of last filters updating */
  private lastFiltersGettingTime: number = 0

  /**
   * Generate a random Device ID
   * @returns {string}
   */
  private static generateDeviceID() {
    const length: number = 15
    return Array(length)
      .fill(0)
      .map(() => String.fromCharCode((Math.random() * 25 + 97) | 0))
      .join('')
  }

  /**
   * @constructor
   * @param {number} version API version
   */
  public constructor(version: number = 2.6) {
    this.version = version

    // Update test photo buffer
    this.getTestPhotoBuffer().then(testPhotoBuffer => {
      this.testPhotoBuffer = testPhotoBuffer
    })

    // First filters updating
    this.getFiltersDetail().then(memoryFilters => {
      this.memoryFilters = memoryFilters
    })
  }


  /**
   * Request url getter
   */
  private get baseUrl(): string {
    const currentServer = FaceApp.AVAILABLE_SERVERS[this.currentServerInx]
    const currentUrl = `https://node-0${currentServer}.faceapp.io/api/v${
      this.version
    }/photos`

    return currentUrl
  }

  /**
   * Switches server index
   * @param serverInx Server index
   */
  public switchServerInx(serverInx: number) {
    this.currentServerInx = Math.max(0, Math.min(serverInx, FaceApp.AVAILABLE_SERVERS.length - 1))
  }

  /**
   * Runs an photo through the [FaceApp](https://www.faceapp.com/) algorithm
   * @param {Buffer} path Path to Image OR Image Buffer
   * @param {string} [filterID] Filter ID
   * @return {Promise<Buffer>}
   */
  public async process(path: Buffer, filterID: string): Promise<Buffer> {
    try {
      const arg: ProcessResponse = await this.getAvailableFilters(path)
      const img: Buffer = await this.getFilteredImage(arg, filterID)
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
   * Get array of available filters names
   * @return {Promise<string[]>}
   */
  public async getFilters(): Promise<string[]> {
    const filters: Filter[] = await this.getFiltersDetail()
    const filtersList: string[] = filters.map((a: Filter) => a.id)

    return filtersList
  }

  /**
   * Get list all available filters with details
   * @returns {Promise<Filter[]>}
   */
  public async getFiltersDetail(): Promise<Filter[]> {
    // If the time has not yet come
    if (
      this.memoryFilters != null &&
      Date.now() < this.lastFiltersGettingTime + FaceApp.FILTERS_UPDATING_TIME
    ) {
      return this.memoryFilters
    }

    const testImageBuffer: Buffer = await this.getTestPhotoBuffer()
    const filtersResponse: ProcessResponse = await this.getAvailableFilters(
      testImageBuffer
    )
    const filters: Filter[] = filtersResponse.filters

    // Updating available filters
    this.memoryFilters = filters
    this.lastFiltersGettingTime = Date.now()

    return filters
  }

  /**
   * Return available filters for photo
   * @param {Buffer} buffer Photo buffer
   * @return {Promise<ProcessResponse>}
   */
  private async getAvailableFilters(buffer: Buffer): Promise<ProcessResponse> {
    const deviceID: string = FaceApp.generateDeviceID()

    const res = await superagent
      .post(this.baseUrl)
      .set('User-Agent', FaceApp.API_USER_AGENT)
      .set('X-FaceApp-DeviceID', deviceID)
      .attach('file', buffer, 'image.png')

    const code = res.body.code
    const filters = res.body.filters.map((o: any): Filter => ({
      id: o.id,
      title: o.title,
      cropped: o.is_paid ? true : o.only_cropped,
      paid: o.is_paid
    }))

    const processResponse: ProcessResponse = { code, deviceID, filters }

    return { code, deviceID, filters }
  }

  /**
   * @param {ProcessResponse} args Input Object
   * @param {string} filterID Filter ID
   * @return {Promise<Buffer>}
   */
  private async getFilteredImage(
    args: ProcessResponse,
    filterID: string = 'no-filter'
  ): Promise<Buffer> {
    // Remove invalid filters
    const filterArr: Filter[] = args.filters.filter(o => o.id === filterID)

    if (filterArr.length === 0) {
      const filters: string = args.filters.map(o => o.id).join(', ')
      throw new Error(`Invalid Filter ID\nAvailable Filters: '${filters}'`)
    }

    const filter: Filter = filterArr[0]
    const cropped: '1' | '0' = filter.cropped ? '1' : '0'
    const url: string = `${this.baseUrl}/${args.code}/filters/${
      filter.id
    }?cropped=${cropped}`

    const res = await superagent
      .get(url)
      .set('User-Agent', FaceApp.API_USER_AGENT)
      .set('X-FaceApp-DeviceID', args.deviceID)

    return res.body
  }

  /**
   * Returns buffer of test photo
   */
  private async getTestPhotoBuffer(): Promise<Buffer> {
    if (this.testPhotoBuffer === undefined) {
      const resp = await superagent.get(FaceApp.TEST_PHOTO_URL)
      this.testPhotoBuffer = resp.body
    }

    return this.testPhotoBuffer!
  }
}
