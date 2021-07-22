
import Vue from 'vue'

function getTableConfigFromLocal() {
  const configs = localStorage.getItem('tableConfig')
  try {
    return JSON.parse(configs)
  } catch (e) {
    return {}
  }
}

const state = {
  tableConfig: getTableConfigFromLocal()
}

const mutations = {
  SET_TABLE_CONFIG: (state, item) => {
    const _tableConfig = getTableConfigFromLocal()
    Vue.set(_tableConfig, item.key, item.value)
    localStorage.setItem('tableConfig', JSON.stringify(_tableConfig))
  }
}

const actions = {
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
