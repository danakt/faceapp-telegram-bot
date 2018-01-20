import getTelegramBot from './utils/getTelegramBot'
import FaceApp from './libs/FaceApp'
import I18n from './libs/I18n'
import { locales } from './lang'
import { createEvents } from './events'

const FACEAPP_VERSION = 2.6

const bot = getTelegramBot(process.env.TOKEN)
const faceApp = new FaceApp(FACEAPP_VERSION)
const i18n = new I18n(locales)

/** Register event listeners */
createEvents(bot, faceApp, i18n)
