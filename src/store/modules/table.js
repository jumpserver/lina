
import Vue from 'vue'

function getTableConfigfromCookie() {
  return localStorage.getItem('tableConfig') ? JSON.parse(localStorage.getItem('tableConfig')) : {}
}

const state = {
  tableConfig: getTableConfigfromCookie()
}

const mutations = {
  SET_TABLE_CONFIG: (state, tableConfig) => {
    const _tableConfig = localStorage.getItem('tableConfig') ? JSON.parse(localStorage.getItem('tableConfig')) : {}
    Vue.set(_tableConfig, tableConfig.key, tableConfig.value)
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
