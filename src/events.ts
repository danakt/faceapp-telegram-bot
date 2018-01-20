import * as TelegramBot from 'node-telegram-bot-api'
import FaceApp from './libs/FaceApp'
import getPhotoBufferById from './utils/getPhotoBufferById'
import arrayToButtons from './utils/arrayToButtons'
import I18n from './libs/I18n'

/**
 * Creates event listeners
 */
export function createEvents(bot: TelegramBot, faceApp: FaceApp, i18n: I18n): void {
  // Starting dialog with bot
  bot.onText(/^\/start|^\/help/, message => {
    // Detect user language
    const langCode: string = message.from!.language_code!.slice(0, 2).toLocaleLowerCase()
    i18n.setLangCode(langCode)

    const chatId = message.chat.id
    bot.sendMessage(chatId, i18n.getMessage('START'), { parse_mode: 'Markdown' })
  })

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
      caption: i18n.getMessage('CHOOSE_FILTER'),
      reply_markup: {
        inline_keyboard: inlineKeys
      },
    })
  })

  // Callback query listener
  bot.on('callback_query', async (callback: TelegramBot.CallbackQuery) => {
    const message = callback.message!
    const chatId: number = message.chat.id

    // Send waiting messsage
    const waitingMessagePromise = bot.sendMessage(chatId, i18n.getMessage('PHOTO_IS_PROCESSING'), {
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
