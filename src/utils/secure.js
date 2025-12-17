/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

const xss = require('xss')
const excludeTags = ['iframe', 'script']

const options = {
  css: false,
  stripIgnoreTagBody: ['script'],
  onTag(tag, html, options) {
    if (excludeTags.indexOf(tag) !== -1) {
      return html.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
  },
  // 避免把页面样式过滤掉
  onTagAttr(tag, name, value, isWhiteAttr) {
    // 过滤掉标签上的事件
    if (/^on/.test(name)) {
      return name + '=' + '.'
    }
    if (['src', 'href'].indexOf(name) !== -1) {
      return name + '=' + value.replace('javascript:', 'java:').replace('data:', 'dt:')
    }
    return name + '="' + xss.escapeAttrValue(value) + '"'
  }
}
const filter = new xss.FilterXSS(options)

import JSEncrypt from 'jsencrypt'
import CryptoJS from 'crypto-js'
import { VueCookieNext as VueCookie } from 'vue-cookie-next'

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
  return VueCookie.getCookie(name)
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

export default filter
