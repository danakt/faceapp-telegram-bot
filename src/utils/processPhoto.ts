import * as superagent  from 'superagent'
import { process }      from '../faceapp'

/**
 * Processing face on photo
 * @param  {string}          type    Type of input
 * @param  {Array<string>}   filters List of filters for applying to image
 * @param  {string}          url     Image url
 * @return {Promise<string>}
 */
export default async function processPhoto(
  filters: string[],
  url: string
): Promise<Buffer> {
  // Creating request to url
  const imageBuffer: Buffer = await getImageBuffer(url)
  // Applying filters to buffer
  const processedImage: Buffer = await applyFilters(filters, imageBuffer)

  return processedImage
}

/**
 * Get the buffer of image
 * @param  {string} url
 * @return {Promise<Buffer>}
 */
async function getImageBuffer(url: string): Promise<Buffer> {
  // Sometimes for some reason the request to the avatar returns 404,
  // but subsequent requests are successful. So after the first unsuccessful
  // request, we try to make two more.
  let res: superagent.Response
  for (let i = 0; i < 3; i++) {
    res = await superagent.get(url)

    // Breaks loop if request are successful
    if (res.status === 200) {
      break
    }
  }

  // Getting avatar body
  const avatarBody: Buffer = res.body

  return avatarBody
}

/**
 * Applying filters to buffer
 * @param  {Array<string>}    filters
 * @param  {Buffer}           imageBuffer
 * @return {Promise<Buffer>}
 */
async function applyFilters(
  filters: string[],
  imageBuffer: Buffer
): Promise<Buffer> {
  // Yes, non-functional :(
  let accumulate: Buffer = imageBuffer

  for (let filter of filters) {
    accumulate = await process(accumulate, filter)
  }

  return accumulate
}

