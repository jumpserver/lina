import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'
import CryptoJS from 'crypto-js'
import VueCookie from 'vue-cookie'

export function fillKey(key) {
  const KeyLength = 16
  if (key.length > KeyLength) {
    key = key.slice(0, KeyLength)
  }
  const filledKey = Buffer.alloc(KeyLength)
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
  let rsaPublicKeyText = getCookie('jms_public_key')
  if (!rsaPublicKeyText) {
    return password
  }
  const aesKey = (Math.random() + 1).toString(36).substring(2)
  // public key 是 base64 存储的
  rsaPublicKeyText = rsaPublicKeyText.replaceAll('"', '')
  const rsaPublicKey = atob(rsaPublicKeyText)
  const keyCipher = rsaEncrypt(aesKey, rsaPublicKey)
  const passwordCipher = aesEncrypt(password, aesKey)
  return `${keyCipher}:${passwordCipher}`
}

window.aesEncrypt = aesEncrypt
window.fillKey = fillKey

