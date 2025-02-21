export function randomString(length, includeSymbols = false) {
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?'

  // 根据是否包含特殊字符来决定字符集
  let allCharacters = upperCase + lowerCase + numbers
  if (includeSymbols) {
    allCharacters += symbols
  }

  let result = ''

  // 如果包含特殊字符，确保至少包含一个大写字母、一个小写字母、一个数字、一个符号
  if (includeSymbols) {
    result += upperCase.charAt(Math.floor(Math.random() * upperCase.length))
    result += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length))
    result += numbers.charAt(Math.floor(Math.random() * numbers.length))
    result += symbols.charAt(Math.floor(Math.random() * symbols.length))
  }

  const allCharactersLength = allCharacters.length

  // 填充剩余的字符
  for (let i = result.length; i < length; i++) {
    result += allCharacters.charAt(Math.floor(Math.random() * allCharactersLength))
  }

  // 随机打乱结果
  return result.split('').sort(() => 0.5 - Math.random()).join('')
}
