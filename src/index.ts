import * as TelegramBot               from 'node-telegram-bot-api'
import { logRequest, writeLogToFile } from './utils/log'
import prepareFilters                 from './utils/prepareFilters'
import getAvatarUrl                   from './utils/getAvatarUrl'
import processPhoto                   from './utils/processPhoto'
import getAvailableFilters            from './utils/getAvailableFilters'

/** Bot instance */
const bot: TelegramBot = new TelegramBot(process.env.TOKEN, { polling: true })

/** Limit of filters */
const MAX_FILTERS = 5

/**
 * Starting dialog with bot
 * @event /start
 */
bot.onText(/^\/start|^\/help/, msg => {
  const message = `
Hello! I'm Awesome FaceApp Bot.

*Available commands:*
• \`/face <filter> <@username>\` to apply a filter to the user's avatar.
**Example: /face smile @AwesomeFaceAppBot**
• \`/face <filter> <url>\` to apply a filter to photo by url.
**Example: /face smile https://example.com/photo.jpg**
• You can combine up to ${MAX_FILTERS} filters.
**Example: /face smile female hot @AwesomeFaceAppBot**
• \`/filters\` or \`/list\` to get a list of all available filters
• \`help\` to show this message`

  bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' })
})

/**
 * Showing list of filters by request
 * @event /filters
 */
bot.onText(/^\/filters|^\/list/, async msg => {
  const filtersList: string[] = await getAvailableFilters()
  bot.sendMessage(msg.chat.id, filtersList.join('\n'))
})

/**
 * Processing photo
 * @event /face
 */
bot.onText(/^\/face.*$/, async msg => {
  const chatId: number = msg.chat.id
  let waitMessage

  try {
    const matchUser = msg.text.match(/^\/face ([A-z0-9_-\s]*) @([A-z0-9_]{5,})\s*$/)
    const matchUrl = msg.text.match(/^\/face ([A-z0-9_-\s]*) (https?:\/\/.*)/)
    const match = matchUser || matchUrl

    // If no matches, show usage
    if (!match || !match[1]) {
      bot.sendMessage(chatId, 'Usage: /face <filters> <@username>')
      return
    }

    // Prepare and check filters
    const filters: string[] = await prepareFilters(match[1], MAX_FILTERS)
    if (filters.length === 0) {
      bot.sendMessage(chatId, 'No filters inputted')
      return
    }

    // Logging
    logRequest(msg)

    // Sending the waiting message
    waitMessage = await bot.sendMessage(chatId, 'Please wait, the photo is being processed...', {
      disable_notification: true
    })

    if (waitMessage instanceof Error) {
      throw waitMessage
    }

    // Get photo url
    const target: string = match[match.length - 1]
    const photoUrl: string = matchUser
      ? await getAvatarUrl(target)
      : target

    const processedPhoto: Buffer = await processPhoto(filters, photoUrl)
    bot.sendPhoto(chatId, processedPhoto)
    if (waitMessage) {
      bot.deleteMessage(chatId, waitMessage.message_id.toString())
    }
  } catch (err) {
    writeLogToFile(err.message)
    bot.sendMessage(chatId, err.message)

    if (waitMessage) {
      bot.deleteMessage(chatId, waitMessage.message_id.toString())
    }

    throw err
  }
})

/**
 * Ping
 * @event /ping
 */
bot.onText(/^\/ping/, msg => {
  bot.sendMessage(msg.chat.id, 'Pong!')
})
