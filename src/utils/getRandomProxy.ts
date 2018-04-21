const proxyList: [string, number][] = [
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

export function getRandomProxy(): { host: string; port: number } {
  const [host, port] = proxyList[(Math.random() * proxyList.length) | 0]

  return {
    host,
    port: Number(port)
  }
}
