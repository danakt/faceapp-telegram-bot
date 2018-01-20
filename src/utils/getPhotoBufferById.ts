import * as TelegramBot from 'node-telegram-bot-api'
import { get, Response } from 'superagent'

/**
 * Return the photo buffer
 * @param photoId Id of photo file
 * @param bot Telegram bot instance
 */
export default async function getPhotoBufferById(photoId: string, bot: TelegramBot): Promise<Buffer> {
  const photoLink = await bot.getFileLink(photoId)
  if (photoLink instanceof Error) {
    throw photoLink
  }

  const response: Response = await get(photoLink).buffer()
  const photoBuffer: Buffer = response.body

  return photoBuffer
}
