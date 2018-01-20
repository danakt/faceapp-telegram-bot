import getTelegramBot from './utils/getTelegramBot'
import getFaceApp from './utils/getFaceApp'
import { createEvents } from './events'

/**
 * Bot instance
 */
const bot = getTelegramBot()

/**
 * FaceApp instance
 */
const faceApp = getFaceApp()

createEvents(bot, faceApp)
