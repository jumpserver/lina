export class ObjectLocalStorage {
  constructor(key, attr) {
    this.key = key
    this.attr = attr
  }

  b64(val) {
    return btoa(unescape(encodeURIComponent(val)))
  }

  getObject() {
    const stored = window.localStorage.getItem(this.key)
    let value = {}
    try {
      value = JSON.parse(stored)
    } catch (e) {
      console.warn('localStorage value is not a valid JSON: ', this.key)
    }
    if (!value || typeof value !== 'object') {
      value = {}
    }
    return value
  }

  get(attr, defaults) {
    const obj = this.getObject(this.key)
    if (!attr && this.attr) {
      attr = this.attr
    }
    const attrSafe = this.b64(attr)
    const val = obj[attrSafe]
    if (val === undefined) {
      return defaults
    }
    return val
  }

  set(attr, value) {
    const obj = this.getObject(this.key)
    if (value === undefined && this.attr) {
      value = attr
      attr = this.attr
    }
    const attrSafe = this.b64(attr)
    obj[attrSafe] = value
    window.localStorage.setItem(this.key, JSON.stringify(obj))
  }
}
