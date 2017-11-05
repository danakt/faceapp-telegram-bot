import { Message } from 'node-telegram-bot-api'

/**
 * Send log in console
 * @param msg
 */
export function logRequest(msg: Message) {
  const formattedMessage: string = `
  Request by ${msg.from.first_name} ${msg.from.last_name} ${msg.from.username && '(@' + msg.from.username + ')'}
  ${msg.text}`

  console.log(formattedMessage)
}
