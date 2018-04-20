import * as TelegramBot from 'node-telegram-bot-api'

/**
 * Returns telegram bot instance
 * @return {TelegramBot}
 */
export default function createTelegramBot(TOKEN: string | void, options: TelegramBot.ConstructorOptions): TelegramBot {
  if (TOKEN == null) {
    throw new Error('Token is missing')
  }

  // Bot instance
  return new TelegramBot(TOKEN, options)
}
