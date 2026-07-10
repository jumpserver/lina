export function toSentenceCase(string) {
  if (!string) return string
  if (string.indexOf('/') > 0) return string
  const sentence = string
    .trim()
    .split(' ')
    .map((item, index) => {
      if (item.length === 0) return ''
      if (item.length === 1) return item.toLowerCase()

      if (item[0] === item[0].toUpperCase() && item[1] === item[1].toUpperCase()) {
        return item
      }

      if (index === 0) {
        return item[0].toUpperCase() + item.slice(1)
      }
      if (item[0] !== item[0].toLowerCase() && item.slice(1) === item.slice(1).toLowerCase()) {
        return item[0].toLowerCase() + item.slice(1)
      }
      return item
    })
    .join(' ')
  return sentence[0].toUpperCase() + sentence.slice(1)
}
