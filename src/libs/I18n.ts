import { locales } from '../lang'
import { LOADIPHLPAPI } from 'dns';

type LangLibrary = typeof locales
// type LangLibrary = { [langCode: string]: { [key: string]: string | Function } }

/**
 * Internationalisation
 */
export default class I18n {
  /**
   * Language code
   */
  private langCode: string = 'en'

  /**
   * List of supported language codes
   */
  private supportedLangCodes: string[]

  /**
   * @constructor
   * @param langLib Languages library
   */
  public constructor(private langLib: LangLibrary) {
    this.supportedLangCodes = Object.keys(langLib)
  }

  /**
   * Sets lang code
   * @param langCode Language code
   */
  public setLangCode(langCode: string) {
    if (this.supportedLangCodes.includes(langCode)) {
      this.langCode = langCode
    }
  }

  /**
   * Resturns internationalized message
   * @return {string}
   */
  public getMessage(
    key: keyof LangLibrary['en'],
    langCode: string = this.langCode,
  ): string {
    const langBlock: LangLibrary['en'] | void = this.langLib[langCode as keyof LangLibrary]

    if (langCode !== 'en' && langBlock == null) {
      return this.getMessage(key, 'en')
    }

    const message: string | void = langBlock[key]

    if (langCode !== 'en' && message === undefined) {
      return this.getMessage(key, 'en')
    } else if (langCode === 'en' && message === undefined) {
      throw new Error(`Not found lang key "${key}"`)
    }

    return message
  }
}
