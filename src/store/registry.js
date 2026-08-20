let storeInstance = null

export function setStore(store) {
  storeInstance = store
}

export function getStore() {
  return storeInstance
}
