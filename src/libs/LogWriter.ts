import { createWriteStream, existsSync, mkdirSync, WriteStream, readFile } from 'fs'

/**
 * Class for writing logs to logfile
 */
export default class LogWritter {
  /** Write streams */
  private writeStreams: {
    [key: string]: {
      [dateString: string]: WriteStream
    }
  } = {}

  /** Date of log writer in format yyyy-mm-dd */
  private dateString: string = ''

  /**
   * @param {string} dirName Directory of log files
   */
  public constructor(private dirName: string) {
    this.makeLogDirIfNotExists()
  }

  /**
   * Writes log to file
   * @param {string} text Text to log
   * @param {Level} level Level of log
   */
  public writeToLog(text: string, level: Level = 'info'): void {
    this.makeLogDirIfNotExists()

    const dateString: string = this.getDateString()

    // Making new writestream if no exists
    if (this.writeStreams[level] == null || this.writeStreams[level][dateString] == null) {
      // Closing all streams
      if (this.writeStreams[level] != null) {
        const streamsList = this.writeStreams[level]

        for (const key in streamsList) {
          streamsList[key].close()
        }
      }

      this.writeStreams[level] = {
          [dateString]: createWriteStream(this.getFilePath(level), {
          flags: 'a+',
          encoding: 'utf8',
          autoClose: true,
        })
      }
    }

    const writeStream: WriteStream = this.writeStreams[level][dateString]
    writeStream.write(text.replace(/^\n^|^  /gm, '') + '\n')
  }

  /**
   * Return current logfile
   * @return {Promise<string>}
   */
  public getLogs(level: Level): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      readFile(this.getFilePath(level), 'utf-8', (err, data: string) => {
        if (err) {
          reject(err)
          return
        }

        resolve(data)
      })
    })
  }

  /**
   * Returns the file path of logfile
   * @param {string} level Level of logging
   * @return {string}
   */
  private getFilePath(level: Level): string {
    const dateString: string = this.getDateString()
    const filePath: string = `${this.dirName}/${level}-${dateString}.log`

    return filePath
  }

  /**
   * Adds zero berofe the two-digit number if needed, and returns string
   * @param {number} num
   * @return {string}
   */
  private addZeroBefore(num: number): string {
    const strNum: string = num.toString()

    return strNum.length === 1
      ? '0' + strNum
      : strNum
  }

  /**
   * Rrturns date string in format yyyy-mm-dd
   * @returns {string}
   */
  private getDateString(): string {
    const date: Date = new Date()

    const day: string = this.addZeroBefore(date.getDate())
    const month: string = this.addZeroBefore(date.getMonth() + 1)
    const year: string = date.getFullYear().toString()

    const newDateString: string = `${year}-${month}-${day}`

    // Updating currenct datestring
    if (this.dateString !== newDateString) {
      this.dateString = newDateString
    }

    return this.dateString
  }

  /**
   * Makes dir if it no exists
   */
  private makeLogDirIfNotExists(): void {
    // Making log dir
    if (!existsSync(this.dirName)) {
      mkdirSync(this.dirName)
    }
  }
}
