import { getCategoryTypes as apiGetCategoryTypes } from '@/api/asset'

const state = {
  assetCategories: [],
  assetCategoriesDropdown: [],
  assetCategoriesCascader: []
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
