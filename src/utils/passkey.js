const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

// Use a lookup table to find the index.
const lookup = new Uint8Array(256)
for (let i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i
}

const encode = function(arraybuffer) {
  const bytes = new Uint8Array(arraybuffer)
  let i; const len = bytes.length; let base64url = ''

  for (i = 0; i < len; i += 3) {
    base64url += chars[bytes[i] >> 2]
    base64url += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)]
    base64url += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)]
    base64url += chars[bytes[i + 2] & 63]
  }

  if ((len % 3) === 2) {
    base64url = base64url.substring(0, base64url.length - 1)
  } else if (len % 3 === 1) {
    base64url = base64url.substring(0, base64url.length - 2)
  }

  return base64url
}

const decode = function(base64string) {
  const bufferLength = base64string.length * 0.75
  const len = base64string.length; let i; let p = 0
  let encoded1; let encoded2; let encoded3; let encoded4

  const bytes = new Uint8Array(bufferLength)

  for (i = 0; i < len; i += 4) {
    encoded1 = lookup[base64string.charCodeAt(i)]
    encoded2 = lookup[base64string.charCodeAt(i + 1)]
    encoded3 = lookup[base64string.charCodeAt(i + 2)]
    encoded4 = lookup[base64string.charCodeAt(i + 3)]

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4)
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2)
    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63)
  }

  return bytes.buffer
}

const publicKeyCredentialToJSON = (pubKeyCred) => {
  if (pubKeyCred instanceof Array) {
    const arr = []
    for (const i of pubKeyCred) { arr.push(publicKeyCredentialToJSON(i)) }

    return arr
  }

  if (pubKeyCred instanceof ArrayBuffer) {
    return encode(pubKeyCred)
  }

  if (pubKeyCred instanceof Object) {
    const obj = {}

    for (const key in pubKeyCred) {
      obj[key] = publicKeyCredentialToJSON(pubKeyCred[key])
    }

    return obj
  }

  return pubKeyCred
}

export default {
  'decode': decode,
  'encode': encode,
  'publicKeyCredentialToJSON': publicKeyCredentialToJSON
}

