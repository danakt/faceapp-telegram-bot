import * as request from 'request-promise'
import * as Agent from 'socks5-https-client/lib/Agent'
import * as TelegramBot from 'node-telegram-bot-api'
import { getRandomProxy } from '../proxy'

/**
 * Return the photo buffer
 * @param photoId Id of photo file
 * @param bot Telegram bot instance
 */
export default async function getPhotoBufferById(
  photoId: string,
  bot: TelegramBot
): Promise<Buffer> {
  const photoLink = await bot.getFileLink(photoId)

  if (photoLink instanceof Error) {
    throw photoLink
  }

  // Get random proxy
  const proxy = getRandomProxy()

  // Create request to image
  const resp = await request({
    url: photoLink,
    method: 'GET',
    encoding: 'binary',
    agentClass: Agent,
    agentOptions: {
      socksHost: proxy.host,
      socksPort: proxy.port
    }
  })

  return new Buffer(resp, 'binary')
}
