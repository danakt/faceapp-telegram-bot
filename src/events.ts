import * as TelegramBot from 'node-telegram-bot-api'
import FaceApp from './libs/FaceApp'
import getPhotoBufferById from './utils/getPhotoBufferById'
import arrayToButtons from './utils/arrayToButtons'

/**
 * Creates event listeners
 */
export function createEvents(bot: TelegramBot, faceApp: FaceApp): void {
  // Receiving the photo
  bot.on('photo', async (message: TelegramBot.Message) => {
    const chatId: number = message.chat.id

    // Get filters to show
    const filters: string[] = await faceApp.getFilters()
    const inlineKeys: TelegramBot.InlineKeyboardButton[][] = arrayToButtons(filters)

    // Get last photo from message
    // Last photo in the array is the biggest
    const photoId: string = message.photo![message.photo!.length - 1].file_id

    // Showing filters to apply
    bot.sendPhoto(chatId, photoId, {
      caption: 'Choose the filter to apply to the photo',
      reply_markup: {
        inline_keyboard: inlineKeys
      },
    })

    // Process the photo

    // Sends photo
    // bot.sendPhoto(chatId, processedPhotoBuffer)
  })

  bot.on('callback_query', async (callback: TelegramBot.CallbackQuery) => {
    const message = callback.message!
    const chatId: number = message.chat.id

    // Send waiting messsage
    const waitingMessagePromise = bot.sendMessage(chatId, 'Please await, the photo is being processed...', {
      disable_notification: true
    })

    // Get photo id from message
    const photoId: string = message.photo![message.photo!.length - 1].file_id

    // Get buffer of the photo
    const photoBuffer: Buffer = await getPhotoBufferById(photoId, bot)
    // Process the photo
    const filter: string = callback.data!
    const processedPhotoBuffer: Buffer = await faceApp.process(photoBuffer, filter)

    // Delete waiting message
    waitingMessagePromise.then(message => {
      if (!(message instanceof Error)) {
        bot.deleteMessage(chatId, message.message_id.toString())
      }
    })

    // Sendimng processed photo
    bot.sendPhoto(chatId, processedPhotoBuffer)
  })

}
