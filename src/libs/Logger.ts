import LogWriter from './LogWriter'
import * as dateformat from 'dateformat'

/**
 * Logging API
 */
export default class Logger extends LogWriter {
  /**
   * @param logDir Directory for saving log files
   */
  public constructor(logDir: string) {
    super(logDir)
  }

  /**
   * Write info log
   * @param {string} message Info message
   */
  public info(message: string): void {
    const formattedMessage = this.formatMessage(message)
    this.writeToLog(formattedMessage, 'info')

    console.info(formattedMessage)
  }

  /**
   * Write error message
   * @param {string} message Error message
   */
  public error(message: string): void {
    const formattedMessage = this.formatMessage(message)
    this.writeToLog(formattedMessage, 'error')

    console.error(formattedMessage)
  }

  /**
   * Returns the time
   * @return {string}
   */
  public getDate(): string {
    const now: Date = new Date()
    // const dateString: string = dateformat(now, 'yyyy-mm-dd HH:MM:ss')
    // Log file alredy has date
    const dateString: string = dateformat(now, 'HH:MM:ss')

    return dateString
  }

  /**
   * Formatting the message for log
   * @param {string} message The message
   */
  public formatMessage(message: string) {
    const date: string = this.getDate()
    const formatMessage: string = `${date}: ${message}`

    return formatMessage
  }
}
