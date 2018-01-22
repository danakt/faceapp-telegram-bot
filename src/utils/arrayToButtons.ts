import { InlineKeyboardButton } from 'node-telegram-bot-api'

/**
 * Formats the filter name
 * @param filter Filter name
 * @return {string}
 */
function formatFilterName(filter: string): string {
  const replacedLodash = filter.replace(/_/g, '')
  const capitalized = replacedLodash[0].toUpperCase() + replacedLodash.slice(1)

  return capitalized
}

/**
 * Converts 1D array to 2D buttons array
 * @param {string[]} strList
 * @return {InlineKeyboardButton[][]}
 */
export default function arrayToButtons(strList: string[]): InlineKeyboardButton[][] {
  // Removing dublicates and copy array to available mutatings
  const uniqueArray: string[] = [...new Set(strList)]
  // Out 2D array
  const strList2d: string[][] = []

  // If the array lingth is odd, add only first button
  if (uniqueArray.length % 2 === 1) {
    strList2d.push(uniqueArray.splice(0, 1))
  }

  // Adding other buttons to array
  while (uniqueArray.length) {
    strList2d.push(uniqueArray.splice(0, 2))
  }

  // Transforms string array to buttons
  const buttons = strList2d.map((strList: string[]) => {
    return strList.map((item: string, i: number): InlineKeyboardButton => {
     return {
        text: formatFilterName(item),
        callback_data: item,
      }
    })
  })

  return buttons
}
