/**
 * Generate a random Device ID
 * @returns {string}
 */
export const generateDeviceId = (): string => {
  const length: number = 15

  return Array(length)
    .fill(0)
    .map(() => String.fromCharCode((Math.random() * 25 + 97) | 0))
    .join('')
}
