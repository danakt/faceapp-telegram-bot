import * as TelegramBot from 'node-telegram-bot-api'

/**
 * Returns telegram bot instance
 * @return {TelegramBot}
 */
export default function getTelegramBot(TOKEN: string | void): TelegramBot {
  if (TOKEN == null) {
    throw new Error('Token is not setted')
  }

  // Bot instance
  const bot: TelegramBot = new TelegramBot(TOKEN, { polling: true })
  return bot
}
