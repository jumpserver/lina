<template>
  <div v-if="!loading" class="platform-form">
    <GenericCreateUpdatePage
      :url="url"
      :fields="fields"
      :initial="initial"
      :fields-meta="fieldsMeta"
      :clean-form-value="cleanFormValue"
      :after-get-form-value="afterGetFormValue"
    />
  </div>
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { fieldsMeta } from './const'

export default {
  name: 'PlatformCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      loading: true,
      showDialog: false,
      settingItem: {
        setting: {},
        name: '',
        port: 0
      },
      initial: {
        comment: '',
        charset: 'utf8',
        category_type: ['host', 'linux'],
        automation: {
          ansible_enabled: true
        }
      },
      fields: [
        [this.$t('common.Basic'), [
          'name', 'category_type', 'charset', 'domain_enabled'
        ]],
        ['配置', [
          'protocols_enabled', 'protocols',
          'su_enabled', 'su_method'
        ]],
        ['自动化', ['automation']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta,
      url: `/api/v1/assets/platforms/`,
      cleanFormValue: (values) => {
        const category_type = values['category_type']
        values['category'] = category_type[0]
        values['type'] = category_type[1]
        return values
      },
      afterGetFormValue: (obj) => {
        if (obj['category'] && obj['type']) {
          obj['category_type'] = [obj['category'].value, obj['type'].value]
        }
        return obj
      }
    }
  },
  async mounted() {
    try {
      await this.setCategories()
      await this.setConstraints()
    } finally {
      this.loading = false
    }
  },
  methods: {
    async setCategories() {
      const category = this.$route.query.category
      const type = this.$route.query.type
      const state = await this.$store.dispatch('assets/getAssetCategories')
      this.fieldsMeta.category_type.el.options = state.assetCategoriesCascader
      if (category && type) {
        this.initial.category_type = [category, type]
      }
      this.url += `?category=${category}&type=${type}`
      return new Promise((resolve, reject) => resolve(true))
    },
    async setConstraints() {
      const category = this.$route.query.category
      const type = this.$route.query.type
      const url = `/api/v1/assets/categories/constraints/?category=${category}&type=${type}`
      const constraints = await this.$axios.get(url)

      const fieldsCheck = ['protocols_enabled', 'domain_enabled', 'su_enabled']
      for (const field of fieldsCheck) {
        let disabled = constraints[field] === false
        if (field === 'protocols_enabled') {
          disabled = disabled && constraints['protocols'].length === 0
        }
        this.initial[field] = !disabled
        _.set(this.fieldsMeta, `${field}.el.disabled`, disabled)
      }
      this.fieldsMeta.protocols.el.choices = constraints['protocols'] || []

      if (constraints['charset_enabled'] === false) {
        this.fieldsMeta.charset.hidden = () => true
      }

      await this.setAutomations(constraints['automation'])
    },
    async setAutomations(automation) {
      const autoFieldsMeta = this.fieldsMeta.automation.fieldsMeta
      const autoFields = this.fieldsMeta.automation.fields
        .filter(item => item.endsWith('_method'))
        .map(item => item.replace('_method', ''))

      const initial = this.initial.automation || {}
      initial['ansible_enabled'] = automation['ansible_enabled']
      initial['ansible_config'] = JSON.stringify(automation['ansible_config'])

      for (const item of autoFields) {
        const itemEnabledKey = item + '_enabled'
        const itemMethodKey = item + '_method'
        const itemEnabled = automation[itemEnabledKey]
        // 设置 enableKey disabled 和 默认值
        if (itemEnabled === false) {
          initial[itemEnabledKey] = false
          _.set(autoFieldsMeta, `${itemEnabledKey}.el.disabled`, true)
        } else {
          initial[itemEnabledKey] = true
        }

        // 设置 enableKey Hidden
        _.set(autoFieldsMeta, `${itemEnabledKey}.hidden`, (formValue) => {
          return !formValue['ansible_enabled']
        })
        // 设置 enableMethod Hidden
        _.set(autoFieldsMeta, `${itemMethodKey}.hidden`, (formValue) => {
          return !formValue[itemEnabledKey] || !formValue['ansible_enabled']
        })
        // 设置 method 类型和 options
        _.set(autoFieldsMeta, `${itemMethodKey}.type`, 'select')
        const methods = automation[itemMethodKey + 's'] || []
        autoFieldsMeta[itemMethodKey].options = methods.map(method => {
          return { value: method['id'], label: method['name'] }
        })
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.platform-form >>> {
  .el-form-item {
    .el-select:not(.prepend) {
      width: 100%;
    }
  }
  .el-cascader {
    width: 100%;
  }
}
</style>

