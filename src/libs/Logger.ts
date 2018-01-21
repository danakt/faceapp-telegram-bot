import LogWriter from './LogWriter'

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
    const curDate: Date = new Date()
    const utcString: string = curDate.toUTCString()

    const formatMessage: string = `[${utcString}] ${message}`
    console.info(formatMessage)

    this.writeToLog(formatMessage, 'info')
  }

  /**
   * Write error message
   * @param {string} message Error message
   */
  public error(message: string): void {
    const curDate: Date = new Date()
    const utcString: string = curDate.toUTCString()

    const formatMessage: string = `[${utcString}] ${message}`
    console.error(formatMessage)

    this.writeToLog(formatMessage, 'error')
  }
}
