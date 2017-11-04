import * as TelegramBot     from 'node-telegram-bot-api'
import token                from './token'
import prepareFilters       from './utils/prepareFilters'
import getAvatarUrl         from './utils/getAvatarUrl'
import processPhoto         from './utils/processPhoto'
import getAvailableFilters  from './utils/getAvailableFilters'

/** Bot instance */
const bot: TelegramBot = new TelegramBot(token, { polling: true })

/** Limit of filters */
const MAX_FILTERS = 5

/**
 * Starting dialog with bot
 * @event /start
 */
bot.onText(/^\/start/, msg => {
  const message = 'Hello, I\'m Awesome FaceApp Bot. To apply a filter to ' +
    'the user\'s avatar, type /face [filter] @[username]. Example: \n' +
    '/face smile @AwesomeFaceAppBot\n\n' +

    `You can combine up to ${MAX_FILTERS} filters. E.g.:\n` +
    '/face smile female hot @AwesomeFaceAppBot\n\n' + 

    'To get a list of all available filters, type /filters'

  bot.sendMessage(msg.chat.id, message)
})

/**
 * Showing list of filters by request
 * @event /filters
 */
bot.onText(/^\/filters/, async msg => {
  const filtersList: string[] = await getAvailableFilters()
  bot.sendMessage(msg.chat.id, filtersList.join('\n'))
})

/**
 * Processing user avatar
 * @event /face [filters] @[username]
 */
bot.onText(/\/face ([A-z0-9_-\s]*) @([A-z0-9_]{5,})\s*$/, async (msg, match) => {
  const username: string  = match[match.length - 1]
  const filters: string[] = await prepareFilters(match[1], MAX_FILTERS)
    
  if (filters.length === 0) {
    throw new Error('Введите фильтры')
  }

  const avatarUrl: string = await getAvatarUrl(username)
  const processedPhoto: Buffer = await processPhoto(filters, avatarUrl)

  bot.sendPhoto(msg.chat.id, processedPhoto)
})

/**
 * Processing image by url
 * @event /face [filters] [url]
 */
bot.onText(/\/face ([A-z0-9_-\s]*) (https?:\/\/.*)/, async (msg, match) => {
  const url: string       = match[match.length - 1]
  const filters: string[] = await prepareFilters(match[1], MAX_FILTERS)
    
  if (filters.length === 0) {
    throw new Error('Введите фильтры')
  }

  const processedPhoto: Buffer = await processPhoto(filters, url)

  bot.sendPhoto(msg.chat.id, processedPhoto)
})