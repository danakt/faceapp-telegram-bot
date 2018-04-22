import * as http from 'http'
import * as request from 'request-promise'
import * as FormData from 'form-data'

/**
 * FaceApp API version
 */
const VERSION = 2.6

/**
 * URL for requests
 */
const BASE_URL = `https://node-03.faceapp.io/api/v${VERSION}/photos`

/** Test photo URL */
const TEST_PHOTO_URL = 'https://i.imgur.com/nVsxMNp.jpg'

/** Useragent for creating request */
const API_USER_AGENT = 'FaceApp/2.0.561 (Linux; Android 6.0)'

/**
 * Send photo to FaceApp servers and returns filters list
 * @return {Promise<Filters[]>}
 */
export const sendPhoto = async (
  buffer: Buffer,
  deviceId: string,
  agentClass: http.Agent,
  proxy: { host: string; port: number }
): Promise<{ filters: Filter[]; code: string }> => {
  try {
    const req = request({
      url: BASE_URL,
      method: 'POST',
      headers: {
        'User-Agent': API_USER_AGENT,
        'X-FaceApp-DeviceID': deviceId
      },
      forever: true,
      agentClass,
      agentOptions: {
        socksHost: proxy.host,
        socksPort: proxy.port
      }
    })

    // Append image to request
    const formData = req.form()
    formData.append('file', buffer, { filename: 'image.png' })

    // Waiting for response
    const res = JSON.parse(await req)

    const filters: Filter[] = res.filters.map((o: any): Filter => ({
      id: o.id,
      title: o.title,
      onlyCropped: o.is_paid ? true : o.only_cropped,
      isPaid: o.is_paid,
      emoji: o.button_icon.ios_emoji
    }))

    return { filters, code: res.code }
  } catch (err) {
    if (err.statusCode === 400) {
      const code: string = JSON.parse(err.error).err.code || ''

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
 * Get processed photo
 * @return {Promise<Buffer>}
 */
export const getPhoto = async (
  filter: string,
  code: string,
  isCropped: '1' | '0',
  deviceId: string,
  agentClass: http.Agent,
  proxy: { host: string; port: number }
): Promise<Buffer> => {
  const resp = await request({
    url: `${BASE_URL}/${code}/filters/${filter}?cropped=${isCropped}`,
    method: 'GET',
    headers: {
      'User-Agent': API_USER_AGENT,
      'X-FaceApp-DeviceID': deviceId
    },
    encoding: 'binary',
    forever: true,
    agentClass,
    agentOptions: {
      socksHost: proxy.host,
      socksPort: proxy.port
    }
  })

  return new Buffer(resp, 'binary')
}
