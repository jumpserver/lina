import Vue from 'vue'

function getTableConfigFromLocal() {
  const configs = localStorage.getItem('tableConfig')
  try {
    return JSON.parse(configs)
  } catch (e) {
    return {}
  }
}

function getProtocolMapFromLocal() {
  const mapStr = localStorage.getItem('protocolMap')
  try {
    const obj = JSON.parse(mapStr)
    return obj ? new Map(Object.entries(obj)) : new Map()
  } catch (e) {
    return new Map()
  }
}

const state = {
  tableConfig: getTableConfigFromLocal(),
  protocolMap: getProtocolMapFromLocal()
}

const mutations = {
  SET_TABLE_CONFIG: (state, item) => {
    const _tableConfig = getTableConfigFromLocal()
    Vue.set(_tableConfig, item.key, item.value)
    localStorage.setItem('tableConfig', JSON.stringify(_tableConfig))
  },
  SET_PROTOCOL_MAP_ITEM: (state, item) => {
    state.protocolMap.set(item.key, item.value)
    const obj = Object.fromEntries(state.protocolMap)
    localStorage.setItem('protocolMap', JSON.stringify(obj))
  }
}

const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
