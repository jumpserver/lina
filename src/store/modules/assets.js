import { getCategoryTypes as apiGetCategoryTypes } from '@/api/asset'

const state = {
  assetCategories: [],
  assetCategoriesDropdown: [],
  assetCategoriesCascader: []
}

const mutations = {
  SET_CATEGORIES: (state, categories) => {
    state.assetCategories = categories
    const toOption = (choice) => {
      return {
        label: choice['name'],
        value: choice['id']
      }
    }
    state.assetCategoriesCascader = categories.map((item) => {
      const children = item.children.map(toOption)
      const option = toOption(item)
      option.children = children
      return option
    })
  },
  SET_CATEGORIES_DROPDOWN: (state, categories) => {
    const dropdown = []
    for (const category of categories) {
      category.children.forEach((type, index) => {
        const option = {
          name: type.id,
          title: type.name,
          type: 'primary',
          category: category.id,
          has: true
        }
        if (index === 0) {
          option.group = category.name
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
