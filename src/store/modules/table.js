import VueCookie from 'vue-cookie'

function getTableConfigfromCookie() {
  return JSON.parse(VueCookie.get('tableConfig')) || {}
}

const state = {
  tableConfig: getTableConfigfromCookie()
}

const mutations = {
  SET_TABLE_CONFIG: (state, tableConfig) => {
    state.tableConfig[tableConfig.key] = tableConfig.value
    VueCookie.set('tableConfig', JSON.stringify(state.tableConfig), 14)
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
