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
        label: choice['display_name'],
        value: choice['value']
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
          name: type.value,
          title: type.display_name,
          type: 'primary',
          category: category.value,
          has: true
        }
        if (index === 0) {
          option.group = category.display_name
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
        console.log('Get category done: ', state.assetCategories)
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
