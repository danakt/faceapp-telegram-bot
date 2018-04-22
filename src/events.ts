import * as TelegramBot from 'node-telegram-bot-api'
import * as Agent from 'socks5-https-client/lib/Agent'
import getPhotoBufferById from './utils/getPhotoBufferById'
import { createButtons } from './utils/createButtons'
import I18n from './libs/I18n'
import Logger from './libs/Logger'
import { sendPhoto, getPhoto } from './utils/faceapp'
import { generateDeviceId } from './utils/generateDeviceId'
import {
  getRandomProxy,
  getRandomProxyIndex,
  proxyList,
  getProxyByIndex
} from './proxy'

/**
 * Type of events configuration
 */
type EventsConfig = {
  adminNicknames: string[]
  bot: TelegramBot
  i18n: I18n
  logger: Logger
}

/**
 * Creates event listeners
 */
export function createEvents({
  adminNicknames,
  bot,
  i18n,
  logger
}: EventsConfig): void {
  /**
   * Checks is user have admins right
   * @return {boolean}
   */
  function isUserAdmin(username: void | string): boolean {
    return typeof username === 'string' && adminNicknames.includes(username)
  }

  /**
   * Starting dialog with bot
   */
  bot.onText(/^\/start|^\/help/, message => {
    // Detect user language
    if (message.from && message.from.language_code) {
      const langCode: string = message.from.language_code
        .slice(0, 2)
        .toLocaleLowerCase()

      i18n.setLangCode(langCode)
    }

    const chatId = message.chat.id
    bot.sendMessage(chatId, i18n.getMessage('START'), {
      parse_mode: 'Markdown'
    })
  })

  /**
   * Receiving the photo
   */
  bot.on('photo', async (message: TelegramBot.Message) => {
    const langCode: string = message
      .from!.language_code!.slice(0, 2)
      .toLocaleLowerCase()
    i18n.setLangCode(langCode)

    const chatId: number = message.chat.id

    // Get last photo from message
    // Last photo in the array is the biggest
    const photoId: string = message.photo![message.photo!.length - 1].file_id

    try {
      // Get buffer of the photo
      const photoBuffer: Buffer = await getPhotoBufferById(photoId, bot)

      // Generate identifier of device
      const deviceId = generateDeviceId()

      // Getting random proxy
      const proxyIndex = getRandomProxyIndex()
      const proxy = getProxyByIndex(proxyIndex)

      // // Sending photo to server and return filters list
      const { filters, code } = await sendPhoto(
        photoBuffer,
        deviceId,
        Agent,
        proxy
      )

      // Showing filters to apply
      bot.sendPhoto(chatId, photoId, {
        caption: i18n.getMessage('CHOOSE_FILTER'),
        reply_markup: {
          inline_keyboard: createButtons(filters, code, deviceId, proxyIndex)
        }
      })
    } catch (err) {
      // Sending error message
      if (err.message === 'No Faces found in Photo') {
        bot.sendMessage(chatId, i18n.getMessage('NO_FACES'))
      } else {
        logger.info(err.message)
        bot.sendMessage(chatId, i18n.getMessage('UNKNOWN_ERROR'))
      }
    }
  })

  /**
   * Callback query listener
   */
  bot.on('callback_query', async (callback: TelegramBot.CallbackQuery) => {
    const message = callback.message!
    const chatId: number = message.chat.id

    // Send waiting message
    const waitingMessagePromise = bot.sendMessage(
      chatId,
      i18n.getMessage('PHOTO_IS_PROCESSING'),
      {
        disable_notification: true
      }
    )

    // Get photo id from message
    const photoId: string = message.photo![message.photo!.length - 1].file_id

    // Get buffer of the photo
    const photoBuffer: Buffer = await getPhotoBufferById(photoId, bot)

    const [
      filter,
      isCropped,
      code,
      deviceId,
      proxyIndex
    ]: string[] = callback.data!.split(':')

    // Proxy
    const proxy = getProxyByIndex(Number(proxyIndex))

    // Writing log
    const photoFile = await bot.getFile(photoId)
    if (photoFile instanceof Error) {
      throw photoFile
    }

    const filePath: string = photoFile.file_path!
    const username: void | string = message.chat!.username
      ? '@' + message.chat!.username
      : `${message.chat!.first_name} ${message.chat!.last_name}`

    // TODO: Show the name of requester
    logger.info(`${username} ${filter} ${filePath}`)

    // Process the photo
    const processedPhotoBuffer: void | Buffer = await getPhoto(
      filter,
      code,
      isCropped as '1' | '0',
      deviceId,
      Agent,
      proxy
    )

    // Sending processed photo
    bot.sendPhoto(chatId, processedPhotoBuffer)

    // Finish answer waiting
    bot.answerCallbackQuery({
      callback_query_id: callback.id
    })

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
      // Currently (23.01.2018) max length of messages is 4096 chars
      const cutLogs = logs.slice(-4e3)
      bot.sendMessage(message.chat.id, cutLogs)
    } catch (err) {
      bot.sendMessage(
        message.chat.id,
        `Could not get logs: ${err && err.message}`
      )
    }
  })
}
