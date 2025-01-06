import { getCategoryTypes as apiGetCategoryTypes } from '@/api/asset'
import request from '@/utils/request'

const state = {
  assetCategories: [],
  assetCategoriesDropdown: [],
  assetCategoriesCascader: [],
  platforms: [],
  platformGetting: false
}

let isFetchingPlatforms = false

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
    return new Promise((resolve, reject) => {
      if (state.platforms.length > 0) {
        // 如果已有数据，直接返回
        resolve(state.platforms)
        return
      }

      if (isFetchingPlatforms) {
        // 如果正在请求中，等待之前的请求完成后再返回
        const checkInterval = setInterval(() => {
          if (!isFetchingPlatforms) {
            clearInterval(checkInterval)
            resolve(state.platforms)
          }
        }, 50)
        return
      }

      // 设置标志位，表示正在请求中
      isFetchingPlatforms = true

      console.log('Get platforms:', '123123')
      request
        .get('/api/v1/assets/platforms/')
        .then(data => {
          state.platforms = data
          isFetchingPlatforms = false // 请求完成，重置标志位
          resolve(data)
        })
        .catch(error => {
          isFetchingPlatforms = false // 请求失败也要重置标志位
          reject(error)
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
