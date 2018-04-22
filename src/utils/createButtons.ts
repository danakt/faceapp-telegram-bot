import { InlineKeyboardButton } from 'node-telegram-bot-api'

/**
 * Formats the filter name
 * @param filter Filter name
 * @return {string}
 */
const formatFilterName = (filter: string): string => {
  const replacedLodash = filter.replace(/_/g, ' ')
  const capitalized = replacedLodash[0].toUpperCase() + replacedLodash.slice(1)

  return capitalized
}

/**
 * Converts 1D array to 2D buttons array
 * @param {string[]} strList
 * @return {InlineKeyboardButton[][]}
 */
export const createButtons = (
  filtersList: Filter[],
  code: string,
  deviceId: string,
  proxyIndex: number
): InlineKeyboardButton[][] => {
  const filtersMap: Record<string, Filter> = filtersList.reduce(
    (acc, item) =>
      acc[item.id] ? acc : Object.assign({}, acc, { [item.id]: item }),
    {} as Record<string, Filter>
  )

  const filtersListUnique = Object.values(filtersMap)

  const filterList2d: Filter[][] = []

  // If the array length is odd, add only first button
  if (filtersListUnique.length % 2 === 1) {
    filterList2d.push(filtersListUnique.splice(0, 1))
  }

  // Adding other buttons to array
  while (filtersListUnique.length) {
    filterList2d.push(filtersListUnique.splice(0, 2))
  }

  // Transforms string array to buttons
  const buttons = filterList2d.map((filters: Filter[]) => {
    return filters.map((item: Filter, i: number): InlineKeyboardButton => {
      return {
        text: `${item.title}${item.emoji ? ` ${item.emoji}` : ''}`,
        callback_data: `${item.id}:${
          item.onlyCropped ? '1' : '0'
        }:${code}:${deviceId}:${proxyIndex}`
      }
    })
  })

  return buttons
}
