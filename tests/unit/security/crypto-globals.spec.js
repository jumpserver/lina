import { encryptPassword } from '@/utils/session-encrypt'
import filter from '@/utils/secure'
import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'
import CryptoJS from 'crypto-js'
import { sm2, sm4 } from 'sm-crypto'
import { generateKeyPairSync, webcrypto } from 'crypto'

const mockCookies = {}
jest.mock('@/utils/storage', () => ({ vueCookie: { get: name => mockCookies[name] } }))

const originalCrypto = Object.getOwnPropertyDescriptor(window, 'crypto')
beforeEach(() => {
  Object.keys(mockCookies).forEach(k => delete mockCookies[k])
  Object.defineProperty(window, 'crypto', { configurable: true, value: webcrypto })
})
afterEach(() => {
  if (originalCrypto) Object.defineProperty(window, 'crypto', originalCrypto)
  else delete window.crypto
})

describe('Cryptography stays in modules', () => {
  it('does not install browser-global encryption or decryption APIs', () => {
    expect(window.encryptPassword).toBeUndefined()
    expect(window.rsaEncrypt).toBeUndefined()
    expect(window.rsaDecrypt).toBeUndefined()
    expect(typeof filter.process).toBe('function')
  })

  it('preserves the RSA/AES envelope and recovers ordinary and Unicode values', () => {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 1024,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
    })
    mockCookies.jms_public_key = Buffer.from(publicKey).toString('base64')
    const rsa = new JSEncrypt()
    rsa.setPrivateKey(privateKey)
    for (const password of ['normal-password', '临时验证用口令-✓']) {
      const [keyCipher, passwordCipher] = encryptPassword(password).split(':')
      const key = rsa.decrypt(keyCipher)
      expect(key).toMatch(/^[A-Za-z0-9]{16}$/)
      const recovered = CryptoJS.AES.decrypt(passwordCipher, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding
      }).toString(CryptoJS.enc.Utf8)
      expect(recovered).toBe(password)
    }
  })

  it('preserves the GM envelope and empty-password semantics', () => {
    expect(encryptPassword('')).toBe('')
    const pair = sm2.generateKeyPairHex()
    mockCookies.jms_public_key = Buffer.from(pair.publicKey).toString('base64')
    mockCookies.jms_gm_ssl = '1'
    const password = 'isolated-GM-control'
    const [keyCipher, passwordCipher] = encryptPassword(password).split(':')
    const key = sm2.doDecrypt(Buffer.from(keyCipher, 'base64').toString('hex'), pair.privateKey, 0)
    expect(key).toMatch(/^[A-Za-z0-9]{16}$/)
    const recovered = sm4.decrypt(Buffer.from(passwordCipher, 'base64').toString('hex'), Buffer.from(key).toString('hex'))
    expect(recovered).toBe(password)
  })
})
