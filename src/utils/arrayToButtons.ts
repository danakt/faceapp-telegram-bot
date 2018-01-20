import { InlineKeyboardButton } from 'node-telegram-bot-api'

/**
 * Converts 1D array to 2D buttons array
 * @param {string[]} strList
 * @return {InlineKeyboardButton[][]}
 */
export default function arrayToButtons(strList: string[]): InlineKeyboardButton[][] {
  const isOdd: boolean = strList.length % 2 === 1
  const strListCopy: string[] = strList.slice()
  const strList2d: string[][] = []

  // If the array lingth is odd, add only first button
  if (isOdd) {
    strList2d.push(strListCopy.splice(0, 1))
  }

  // Adding other buttons to array
  while (strListCopy.length) {
    strList2d.push(strListCopy.splice(0, 2))
  }

  // Transforms string array to buttons
  const buttons = strList2d.map((strList: string[]) => {
    return strList.map((item: string, i: number): InlineKeyboardButton => {
     return {
        text: item,
        callback_data: item,
      }
    })
  })

  return buttons
}
