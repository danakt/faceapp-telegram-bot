import FaceApp from '../libs/FaceApp'

/**
 * FaceApp API version
 */
const VERSION = 2.6

/**
 * Returns FaceApp isntance
 */
export default function getFaceApp(): FaceApp {
  return new FaceApp(VERSION)
}
