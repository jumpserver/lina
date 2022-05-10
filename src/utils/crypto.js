import { JSEncrypt } from 'jsencrypt'
import CryptoJS from 'crypto-js'

export function fillKey(key) {
  let keySize = 128
  // 如果超过 key 16 位, 最大取 32 位，需要更改填充
  if (key.length > 16) {
    key = key.slice(0, 32)
    keySize = keySize * 2
  }
  key = key.slice(0, keySize)
  const filledKey = Buffer.alloc(keySize / 8)
  const keys = Buffer.from(key)
  if (keys.length < filledKey.length) {
    for (let i = 0; i < filledKey.length; i++) {
      filledKey[i] = keys[i]
    }
  } else {
    return keys
  }
}

export function aesEncrypt(text, originKey) {
  const key = CryptoJS.enc.Utf8.parse(fillKey(originKey))
  return CryptoJS.AES.encrypt(text, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.ZeroPadding
  }).toString()
}

export function rsaEncrypt(text, pubKey) {
  const jsEncrypt = new JSEncrypt()
  jsEncrypt.setPublicKey(pubKey)
  return jsEncrypt.encrypt(text)
}

window.aesEncrypt = aesEncrypt

