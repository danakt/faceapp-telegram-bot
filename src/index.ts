import { ConstructorOptions } from 'node-telegram-bot-api'
import { resolve } from 'path'
import createTelegramBotInstance from './utils/createTelegramBotInstance'
import * as Agent from 'socks5-https-client/lib/Agent'
import FaceApp from './libs/FaceApp'
import I18n from './libs/I18n'
import Logger from './libs/Logger'
import { locales } from './lang'
import { createEvents } from './events'
import * as request from 'request-promise'
import { getRandomProxy } from './proxy'

const FACEAPP_VERSION = 2.8
const ADMINS = ['danakt']

const connectionProxy = getRandomProxy()
console.log(`Current proxy: ${connectionProxy.host}:${connectionProxy.port}`)

const bot = createTelegramBotInstance(process.env.TOKEN, {
  polling: true,
  request: {
    agentClass: Agent,
    agentOptions: {
      socksHost: connectionProxy.host,
      socksPort: connectionProxy.port
    }
  } as any
})

const i18n = new I18n(locales)
const logger = new Logger(resolve(__dirname, '../logs'))

/** Register event listeners */
createEvents({
  adminNicknames: ADMINS,
  bot,
  i18n,
  logger
})
