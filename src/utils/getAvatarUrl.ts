import * as request from 'request-promise'

/**
 * Returns avatar URL
 * @description  To getting an avatar, makes request to t.me. 
 * Thanks jabher <https://github.com/jabher> for idea.
 * @param  {string} input Username or iamge url
 * @return {Promise<string>}
 */
export default async function getAvatarUrl(input: string): Promise<string> {
  // Getting URL of user avatar
  const userUrl: string = 'http://t.me/' + input
  const body: string = await request(userUrl)
  const imgMatch = body.match(/class="tgme_page_photo_image" src="([^"]*)"/)

  if (imgMatch == null || imgMatch[1] == null) {
    // Avatar is not found
    throw new Error('Image search failed')
  }

  return imgMatch[1]
}