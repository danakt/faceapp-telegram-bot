import { ConstructorOptions } from 'node-telegram-bot-api'
import { resolve } from 'path'
import createTelegramBotInstance from './utils/createTelegramBotInstance'
import Agent from 'socks5-http-client'

import FaceApp from './libs/FaceApp'
import I18n from './libs/I18n'
import Logger from './libs/Logger'
import { locales } from './lang'
import { createEvents } from './events'

const FACEAPP_VERSION = 2.8
const ADMINS = ['danakt']

const bot = createTelegramBotInstance(process.env.TOKEN, {
  polling: true,
  request: {
    agentClass: Agent,
    agentOptions: {
      socksHost: '195.201.137.246',
      socksPort: 1080
    }
  } as any
})

const faceApp = new FaceApp(FACEAPP_VERSION)
const i18n = new I18n(locales)
const logger = new Logger(resolve(__dirname, '../logs'))

/** Register event listeners */
createEvents({
  adminNicknames: ADMINS,
  bot,
  faceApp,
  i18n,
  logger
})
