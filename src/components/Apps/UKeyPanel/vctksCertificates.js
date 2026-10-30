const NO_CERTIFICATE = 0x0A00001C
const NO_KEY = 0x0A00001B
const DEVICE_REMOVED = 0x0A000023
const USER_CANCEL = 0x0B000011

function certificateData(value) {
  if (typeof value !== 'string' || value.length > 32768) throw new Error('UKeyCertificateListInvalid')
  const encoded = value.replace(/\s/g, '')
  if (!encoded || encoded.length % 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    throw new Error('UKeyCertificateListInvalid')
  }
  try {
    return btoa(atob(encoded))
  } catch (_) {
    throw new Error('UKeyCertificateListInvalid')
  }
}

export function parseCertificateList(value) {
  if (typeof value === 'string') {
    if (value.length > 4 * 1024 * 1024) throw new Error('UKeyCertificateListInvalid')
    try {
      value = JSON.parse(value)
    } catch (_) {
      throw new Error('UKeyCertificateListInvalid')
    }
  }
  if (!Array.isArray(value) || value.length > 256) throw new Error('UKeyCertificateListInvalid')
  const ids = new Set()
  return value.map(item => {
    // The Windows plugin returns JSON strings inside the JSON array.
    if (typeof item === 'string') {
      if (item.length > 65536) throw new Error('UKeyCertificateListInvalid')
      try {
        item = JSON.parse(item)
      } catch (_) {
        throw new Error('UKeyCertificateListInvalid')
      }
    }
    if (!item || typeof item !== 'object' ||
        !/^\d+$/.test(String(item.ID)) || !Number.isSafeInteger(Number(item.ID)) ||
        typeof item.CN !== 'string' || typeof item.SN !== 'string' || !item.SN ||
        ids.has(Number(item.ID))) {
      throw new Error('UKeyCertificateListInvalid')
    }
    ids.add(Number(item.ID))
    // Runtime responses use CertData; the vendor manual calls this field Cert.
    const cert = certificateData(item.CertData === undefined ? item.Cert : item.CertData)
    if (item.Cert !== undefined && certificateData(item.Cert) !== cert) {
      throw new Error('UKeyCertificateListInvalid')
    }
    return { ...item, ID: Number(item.ID), Cert: cert }
  })
}

// Keep the native SDK and its selected certificate outside Vue's reactive data.
export default class VCTKSCertificates {
  constructor(sdk) {
    this.sdk = sdk
    this.certificates = []
    this.selected = null
    this.serial = ''
    this.fields = new Map()
  }

  call(method, ...args) {
    try {
      if (typeof this.sdk[method] !== 'function') throw new Error('UKeyCertificateSelectionFailed')
      return this.sdk[method](...args)
    } catch (error) {
      if (Number(error) === USER_CANCEL) throw new Error('OperationCanceled')
      if (error instanceof Error) throw error
      const failure = new Error(String(error))
      failure.code = Number(error)
      throw failure
    }
  }

  clear() {
    this.selected = null
    this.serial = ''
    this.fields.clear()
  }

  scan() {
    try {
      this.certificates = parseCertificateList(this.call('UKey_GetCertInfoList'))
    } catch (error) {
      this.certificates = []
      this.clear()
      if ([NO_CERTIFICATE, NO_KEY, DEVICE_REMOVED].includes(error.code)) return
      throw error
    }
    if (this.selected) {
      // An index is only valid for the current enumeration, never an identity.
      const matches = this.certificates.filter(item => item.Cert === this.selected.Cert)
      if (matches.length === 1) this.selected = matches[0]
      else this.clear()
    }
  }

  select() {
    this.scan()
    if (!this.certificates.length) return null
    let selected = this.selected
    if (!selected) {
      if (this.certificates.length === 1) {
        selected = this.certificates[0]
      } else {
        // This is the only entry point that may open the vendor's native chooser.
        const cert = certificateData(this.call('UKey_GetCert', 1))
        const matches = this.certificates.filter(item => item.Cert === cert)
        if (matches.length !== 1) throw new Error('UKeyCertificateSelectionChanged')
        selected = matches[0]
      }
    }
    try {
      if (this.call('UKey_SetCurCert', selected.ID, selected.CN, selected.SN) !== 0) {
        throw new Error('UKeyCertificateSelectionFailed')
      }
      this.assertCertificate(selected.Cert)
      const serial = this.call('UKey_GetDevSN')
      if (typeof serial !== 'string' || !serial.trim()) throw new Error('UKeyCertificateSelectionFailed')
      if (!this.selected || this.selected.Cert !== selected.Cert) this.fields.clear()
      this.selected = selected
      this.serial = serial
      return selected.Cert
    } catch (error) {
      this.clear()
      throw error
    }
  }

  assertCertificate(expected, certificate) {
    try {
      const actual = certificateData(certificate === undefined ? this.call('UKey_GetCert', 1) : certificate)
      if (actual !== expected) throw new Error('UKeyCertificateSelectionChanged')
      return certificate === undefined ? actual : certificate
    } catch (error) {
      this.clear()
      throw error
    }
  }

  field(type) {
    if (!this.selected) return null
    if (this.fields.has(type)) return this.fields.get(type)
    const values = {
      2: this.selected.SN,
      7: this.selected.issuer,
      8: this.selected.DN,
      9: this.selected.CN
    }
    let value = values[type]
    if (value === undefined || value === null) {
      value = this.call('UKey_GetExtCertInfo', type, this.selected.Cert)
    }
    this.fields.set(type, value)
    return value
  }
}
