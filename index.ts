import * as request     from 'request-promise-native'
import * as TelegramBot from 'node-telegram-bot-api'
import * as faceapp     from 'faceapp'
import * as fs          from 'fs'
import { reduce }       from 'bluebird'
import token            from './token'

/**
 * Bot instance
 */
const bot: TelegramBot = new TelegramBot(token, { polling: true })

/**
 * Limit of filters
 */
const MAX_FILTERS = 3

/**
 * List of available filters
 */
const availableFilters: string[] = [
  'no-filter',
  'smile',
  'smile_2',
  'hot',
  'old',
  'young',
  'female_2',
  'female',
  'male',
  'pan',
  'hitman',
  'hollywood',
  'heisenberg',
  'impression',
  'lion',
  'goatee',
  'hipster',
  'bangs',
  'glasses',
  'wave',
  'makeup',
]

/**
 * Processes the actions in a chat. Matches "/face @[username]"
 */
bot.onText(/\/face ([^@]*)\s?@(.+)/, async (msg, match) => {
  const chatId: number        = msg.chat.id
  const username: string      = match[match.length - 1]
  const filtersMatch: string  = match[1].trim()

  // Create list of filters
  if (filtersMatch === '') {
    // Enter filter, please
    bot.sendMessage(chatId, 'Enter a filter to apply')
    return 
  }

  const filters: string[] = checkFilters(filtersMatch)
  if (availableFilters.length === 0) {
    bot.sendMessage(
      chatId, 
      'Enter an available filter. To get the list of filters, type /filters'
    )
    return 
  }

  // Getting avatar
  const avatarBuffer: null | Buffer = await getUserAvatar(username)
  if (avatarBuffer == null) {
    bot.sendMessage(chatId, 'Avatar is not found')
    
    return
  }
  
  try {
    // Applying filters
    const filteredAvatarBuffer = await reduce(
      filters, 
      (acc: Buffer, filter: string) => applyFilter(acc, filter), 
      avatarBuffer
    )

    // Sending image 
    bot.sendPhoto(chatId, filteredAvatarBuffer)
  } catch(err) {
    bot.sendMessage(chatId, err)
  }
})


/**
 * Writes list of filters by request
 */
bot.onText(/\/filters/, msg => {
  bot.sendMessage(msg.chat.id, availableFilters.join('\n'))
})

/**
 * Get the buffer of user avatar 
 * Thanks jabher <https://github.com/jabher> for idea
 * @param  {string} username 
 * @return {Buffer} 
 */
async function getUserAvatar(username: string): Promise<Buffer | null> {
  // Getting URL of user avatar
  const userUrl: string = 'http://t.me/' + username
  const body: string = await request(userUrl)
  const imgMatch = body.match(/class="tgme_page_photo_image" src="([^"]*)"/)

  if (imgMatch == null || imgMatch[1] == null) {
    // Avatar is not found
    return null
  }

  // Getting avatar body
  const avatarBody: Buffer = await request({ 
    url: imgMatch[1], 
    encoding: null,
  })
  
  return avatarBody
}

/**
 * Transforms inline list of filters to array of filters
 * @param  {string} filtersMatch 
 * @return {Array}
 */
function checkFilters(filtersMatch: string): string[] {
  return filtersMatch.split(' ').filter(
    item => availableFilters.includes(item)
  ).slice(0, MAX_FILTERS)
} 

/**
 * Applies filters to image buffer
 * @prop {Buffer} buffer
 * @prop {string} filter
 */
async function applyFilter(buffer: Buffer, filter: string): Promise<Buffer> {
  if (!availableFilters.includes(filter)) {
    return buffer
  }

  const output: Buffer = await faceapp.process(buffer, filter)
  return output
}
