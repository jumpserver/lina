import { JSEncrypt } from 'jsencrypt'
import CryptoJS from 'crypto-js'
import VueCookie from 'vue-cookie'

export function fillKey(key) {
  let keySize = 128
  // 如果超过 key 16 位, 最大取 32 位，需要更改填充
  if (key.length > 16) {
    key = key.slice(0, 32)
    keySize = keySize * 2
  }
  const filledKeyLength = keySize / 8
  if (key.length >= filledKeyLength) {
    return key.slice(0, filledKeyLength)
  }
  const filledKey = Buffer.alloc(keySize / 8)
  const keys = Buffer.from(key)
  for (let i = 0; i < keys.length; i++) {
    filledKey[i] = keys[i]
  }
  return filledKey
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

export function getCookie(name) {
  return VueCookie.get(name)
}

export function encryptPassword(password) {
  if (!password) {
    return ''
  }
  const aesKey = (Math.random() + 1).toString(36).substring(2)
  // public key 是 base64 存储的
  const rsaPublicKeyText = getCookie('jms_public_key')
    .replaceAll('"', '')
  const rsaPublicKey = atob(rsaPublicKeyText)
  const keyCipher = rsaEncrypt(aesKey, rsaPublicKey)
  const passwordCipher = aesEncrypt(password, aesKey)
  return `${keyCipher}:${passwordCipher}`
}

window.aesEncrypt = aesEncrypt

