import { resolve } from 'path'
import getTelegramBot from './utils/getTelegramBot'
import FaceApp from './libs/FaceApp'
import I18n from './libs/I18n'
import Logger from './libs/Logger'
import { locales } from './lang'
import { createEvents } from './events'

const FACEAPP_VERSION = 2.8
const ADMINS = ['danakt']

const bot = getTelegramBot(process.env.TOKEN)
const faceApp = new FaceApp(FACEAPP_VERSION)
const i18n = new I18n(locales)
const logger = new Logger(resolve(__dirname, '../logs'))

/** Register event listeners */
createEvents({
  adminNicknames: ADMINS,
  bot,
  faceApp,
  i18n,
  logger,
})
