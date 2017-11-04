import * as request     from 'request-promise'
import * as TelegramBot from 'node-telegram-bot-api'
import * as faceapp     from 'faceapp'
import * as colors      from 'colors'
import token            from './token'

/**
 * Bot instance
 */
const bot: TelegramBot = new TelegramBot(token, { polling: true })

/**
 * Limit of filters
 */
const MAX_FILTERS = 5

/**
 * Starting dialog with bot
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
 * Processes the actions in a chat. Matches "/face @[username]"
 */
bot.onText(/\/face ([^@]*)\s?@(.+)/, async (msg, match) => {
  const chatId: number        = msg.chat.id
  const username: string      = match[match.length - 1]
  const filtersMatch: string  = match[1].trim()

  try {
    console.log(`\n\n${colors.yellow('/filter')} ${filtersMatch} ${colors.green(username)}`)

    const filters: string[] = await checkFilters(filtersMatch)
    if (filters.length === 0) {
      bot.sendMessage(
        chatId, 
        'Enter an available filter. To get the list of filters, type /filters'
      )
      return 
    }

    console.log('filters is checked')

    // Getting avatar
    const avatarBuffer: null | Buffer = await getUserAvatar(username)
    if (avatarBuffer == null) {
      bot.sendMessage(chatId, 'Avatar is not found')
      
      return
    }

    console.log('avatar is getted')
    
    let filteredAvatarBuffer: Buffer = avatarBuffer

    for (let filter of filters) {
      filteredAvatarBuffer = await applyFilter(filteredAvatarBuffer, filter)
      console.log(`filter «${filter}» is applied to avatar`)
    }

    
    // Sending image 
    bot.sendPhoto(chatId, filteredAvatarBuffer)
  } catch(err) {
    switch (err.message) {
      case 'No Faces found in Photo': {
        bot.sendMessage(chatId, 'No faces found in avatar :(')
      }

      default: {
        bot.sendMessage(chatId, 'Unknown error :(')
        console.log(err)
      }
    }
  }
})


/**
 * Writes list of filters by request
 */
bot.onText(/\/filters/, async msg => {
  const filtersList: string[] = await getAvailableFilters()
  bot.sendMessage(msg.chat.id, filtersList.join('\n'))
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
async function checkFilters(filtersMatch: string): Promise<string[]> {
  const filtersList: string[] = await getAvailableFilters()

  return filtersMatch
    .split(' ')
    .filter(item => filtersList.includes(item))
    .map(item => item.slice().toLowerCase())
    .slice(0, MAX_FILTERS)
} 

/**
 * Applies filters to image buffer
 * @prop {Buffer} buffer
 * @prop {string} filter
 */
async function applyFilter(buffer: Buffer, filter: string): Promise<Buffer> {
  const output: Buffer = await faceapp.process(buffer, filter)
  return output
}

/**
 * Returns list of available filters
 */
async function getAvailableFilters(): Promise<string[]> {
  return await faceapp.listFilters(true)
}