import { randomString } from '@/utils/common/index'
import { webcrypto } from 'crypto'

jest.mock('@/i18n/i18n', () => ({}))
jest.mock('@/utils/vue/message', () => ({ message: {} }))
jest.mock('@/utils/storage', () => ({ getBasePath: () => '', scopedLocalStorage: {} }))

const originalCrypto = Object.getOwnPropertyDescriptor(window, 'crypto')
const originalMsCrypto = window.msCrypto
function setCrypto(value) {
  Object.defineProperty(window, 'crypto', { configurable: true, value })
}

afterEach(() => {
  jest.restoreAllMocks()
  if (originalCrypto) Object.defineProperty(window, 'crypto', originalCrypto)
  else delete window.crypto
  window.msCrypto = originalMsCrypto
})

describe('Common password randomness', () => {
  it('preserves length, alphabet and required character classes without Math.random', () => {
    setCrypto(webcrypto)
    jest.spyOn(Math, 'random').mockImplementation(() => { throw new Error('Weak random source used') })
    expect(randomString(0)).toBe('')
    for (let i = 0; i < 50; i++) {
      expect(randomString(16)).toMatch(/^[A-Za-z0-9]{16}$/)
      const password = randomString(24, true)
      expect(password).toHaveLength(24)
      expect(password).toMatch(/[A-Z]/)
      expect(password).toMatch(/[a-z]/)
      expect(password).toMatch(/[0-9]/)
      expect([...password].some(c => '!@#$%^&*()-_=+[]{}|;:,.<>?'.includes(c))).toBe(true)
    }
    expect(randomString(2, true)).toHaveLength(4)
  })

  it('rejects out-of-range random samples before mapping to characters', () => {
    let calls = 0
    setCrypto({ getRandomValues: array => { array[0] = calls++ === 0 ? 0xffffffff : 0; return array } })
    expect(randomString(1)).toBe('A')
    expect(calls).toBe(2)
  })

  it('uses the supported msCrypto API and fails when no secure source is available', () => {
    setCrypto(undefined)
    window.msCrypto = { getRandomValues: array => { array.fill(0); return array } }
    expect(randomString(1)).toBe('A')
    window.msCrypto = undefined
    expect(() => randomString(24, true)).toThrow('Secure random number generation is unavailable')
  })
})


describe('Ordinary form IDs', () => {
  it('initializes distinct stable form IDs without a secure random API', () => {
    setCrypto(undefined)
    window.msCrypto = undefined
    const fs = require('fs')
    const path = require('path')
    const vm = require('vm')
    const source = fs.readFileSync(path.join(process.cwd(), 'src/components/Form/DataForm/index.vue'), 'utf8')
    const script = source.split('<script>')[1].split('</script>')[0]
    const code = require('@babel/core').transformSync(script, {
      babelrc: false, configFile: false,
      presets: [[require.resolve('@babel/preset-env'), { targets: { node: 'current' }, modules: 'commonjs' }]]
    }).code
    const module = { exports: {} }
    vm.runInNewContext(code, { module, exports: module.exports, require: () => ({}), window })
    const component = module.exports.default
    const form = { name: 'ordinary form' }
    const first = component.data.call({ _uid: 1, form, submitBtnText: 'Submit' })
    const second = component.data.call({ _uid: 10, form, submitBtnText: 'Submit' })
    expect(typeof first.id).toBe('string')
    expect(first.id).not.toBe(second.id)
    expect(second.id.includes(first.id)).toBe(false)
    expect(first.id).toBe(component.data.call({ _uid: 1, form }).id)
    expect(first.basicForm).toBe(form)
    expect(first.iSubmitBtnText).toBe('Submit')
  })
})
