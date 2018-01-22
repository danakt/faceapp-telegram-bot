import * as TelegramBot from 'node-telegram-bot-api'
import FaceApp from './libs/FaceApp'
import getPhotoBufferById from './utils/getPhotoBufferById'
import arrayToButtons from './utils/arrayToButtons'
import I18n from './libs/I18n'
import Logger from './libs/Logger'

/**
 * Type of events configuration
 */
type EventsConfig = {
  adminNicknames: string[],
  bot: TelegramBot,
  i18n: I18n,
  faceApp: FaceApp,
  logger: Logger,
}

/**
 * Creates event listeners
 */
export function createEvents({ adminNicknames, bot, i18n, faceApp, logger }: EventsConfig): void {
  /**
   * Checks is user have admins right
   * @return {booelan}
   */
  function isUserAdmin(username: void | string): boolean {
    return typeof username === 'string' && adminNicknames.includes(username)
  }

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
    const langCode: string = message.from!.language_code!.slice(0, 2).toLocaleLowerCase()
    i18n.setLangCode(langCode)

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

    try {
      // Get photo id from message
      const photoId: string = message.photo![message.photo!.length - 1].file_id

      // Get buffer of the photo
      const photoBuffer: Buffer = await getPhotoBufferById(photoId, bot)

      // Getting filter
      const filter: string = callback.data!

      // Writing log
      const photoFile = await bot.getFile(photoId)
      if (photoFile instanceof Error) {
        throw photoFile
      }

      const filePath: string = photoFile.file_path!
      const username: void | string = message.chat && message.chat.username
        ? '@' + message.chat.username
        : 'Sombeody'

      // TODO: Show the name of requester
      logger.info(`${username} ${filter} ${filePath}`)

      // Process the photo
      const processedPhotoBuffer: Buffer = await faceApp.process(photoBuffer, filter)

      // Sendimng processed photo
      bot.sendPhoto(chatId, processedPhotoBuffer)
    } catch (err) {
      // Sending error message
      if (err.message === 'No Faces found in Photo') {
        bot.sendMessage(chatId, i18n.getMessage('NO_FACES'))
      } else {
        logger.info(err.message)
        bot.sendMessage(chatId, i18n.getMessage('UNKNOWN_ERROR'))
      }
    }

    // Delete waiting message
    waitingMessagePromise.then(message => {
      if (!(message instanceof Error)) {
        bot.deleteMessage(chatId, message.message_id.toString())
      }
    })
  })

  // Ping-pong
  bot.onText(/^\/ping/, message => {
    bot.sendMessage(message.chat.id, 'Pong!')
  })

  // Logs
  bot.onText(/^\/logs/, async message => {
    const from = message.from
    if (!from) {
      return
    }

    // Checking admin rights
    const username: void | string = from.username
    if (!isUserAdmin(username)) {
      return
    }

    try {
      const logs: string = await logger.getLogs('info')
      bot.sendMessage(message.chat.id, logs)
    } catch (err) {
      bot.sendMessage(message.chat.id, `Сould not get logs: ${err && err.message}`)
    }

  })
}
