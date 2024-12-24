import { getCategoryTypes as apiGetCategoryTypes } from '@/api/asset'
import request from '@/utils/request'

const state = {
  assetCategories: [],
  assetCategoriesDropdown: [],
  assetCategoriesCascader: [],
  platforms: []
}

const mutations = {
  SET_CATEGORIES: (state, categories) => {
    state.assetCategories = categories
    state.assetCategoriesCascader = categories.map(category => {
      category['children'] = category['types']
      return category
    })
  },
  SET_CATEGORIES_DROPDOWN: (state, categories) => {
    const dropdown = []
    for (const category of categories) {
      category.children.forEach((type, index) => {
        const option = {
          name: type.value,
          title: type.label,
          type: 'primary',
          category: category.value,
          has: true
        }
        if (index === 0) {
          option.group = category.label
        }
        dropdown.push(option)
      })
    }
    state.assetCategoriesDropdown = dropdown
  }
}

const actions = {
  getAssetCategories({ commit, dispatch, state }) {
    return new Promise(resolve => {
      if (state.assetCategories.length > 0) {
        resolve(state)
      }
      apiGetCategoryTypes().then(data => {
        commit('SET_CATEGORIES', data)
        commit('SET_CATEGORIES_DROPDOWN', data)
        resolve(state)
      })
    })
  },
  getPlatforms({ commit, dispatch, state }) {
    return new Promise(resolve => {
      if (state.platforms.length > 0) {
        resolve(state.platforms)
      }
      request.get('/api/v1/assets/platforms/').then(data => {
        state.platforms = data
        resolve(data)
      })
    })
  },
  getRecentPlatforms({ commit, dispatch, state }) {
    const recentPlatformIds = JSON.parse(localStorage.getItem('recentPlatforms')) || []
    return new Promise(resolve => {
      dispatch('getPlatforms').then(platforms => {
        resolve(platforms.filter(p => recentPlatformIds.includes(p.id)))
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
