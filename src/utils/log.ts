import { Message } from 'node-telegram-bot-api'
import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs'

let logger: WriteStream
let curDateString: string

/**
 * Send log in console
 * @param msg
 */
export function logRequest(msg: Message): void {
  const curDate: Date = new Date()
  const utcString: string = curDate.toUTCString()

  const formattedMessage: string = `
  ${utcString}
  Request by ${msg.from.first_name} ${msg.from.last_name} ${msg.from.username && '(@' + msg.from.username + ')'}
  ${msg.text}`

  writeLogToFile(formattedMessage)
  console.log(formattedMessage)
}

/**
 * Writes log to logfile
 * @param {string} log
 */
export function writeLogToFile(log: string): void {
  const curDate: Date = new Date()
  const dateString: string = `${curDate.getDate()}-${curDate.getMonth()}-${curDate.getFullYear()}`

  // Making log dir
  if (!existsSync('logs/')) {
    mkdirSync('logs/')
  }

  // Making new writestream
  if (logger == null || curDateString !== dateString) {
    curDateString = dateString

    // Close writestream if opened
    if (logger != null) {
      logger.close()
    }

    logger = createWriteStream('logs/log-' + dateString + '.txt', {
      flags: 'a+',
      encoding: 'utf8',
      autoClose: true,
    })
  }

  logger.write(log.replace(/^\n^|^  /gm, '') + '\n\n')
}
