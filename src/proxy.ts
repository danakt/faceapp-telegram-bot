/**
 * List of proxies
 */
export const proxyList: [string, number][] = [
  ['195.201.137.246', 1080],
  ['195.201.140.57', 1080],
  ['195.201.124.93', 38157],
  ['85.25.207.105', 1080],
  ['207.154.209.166', 2016],
  ['188.40.97.149', 1080],
  ['195.201.143.192', 1080],
  ['138.201.118.57', 1080],
  ['195.201.21.126', 38157],
  ['148.251.34.12', 1080]
]

/**
 * Returns a proxy address
 * @param toString Should the address be a string?
 */
export function getRandomProxy(toString?: false): { host: string; port: number }
export function getRandomProxy(toString: true): string
export function getRandomProxy(
  toString: boolean = false
): { host: string; port: number } | string {
  const [host, port] = proxyList[(Math.random() * proxyList.length) | 0]

  if (toString) {
    return `${host}:${port}`
  }

  return {
    host,
    port: Number(port)
  }
}

/**
 * Returns random proxy index
 * @return {number}
 */
export const getRandomProxyIndex = (): number => {
  return (Math.random() * proxyList.length) | 0
}

/**
 * Returns a proxy by index
 * @param index Index of proxy
 * @return {object}
 */
export const getProxyByIndex = (index: number) => {
  const [host, port] = proxyList[index]

  return {
    host,
    port
  }
}
