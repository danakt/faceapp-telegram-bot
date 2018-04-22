/**
 * Filter interface
 */
declare interface Filter {
  id: string
  title: string
  onlyCropped: boolean
  isPaid?: boolean
  emoji?: string
}
