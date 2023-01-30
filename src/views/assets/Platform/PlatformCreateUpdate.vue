<template>
  <div v-if="!loading" class="platform-form">
    <GenericCreateUpdatePage
      :url="url"
      :fields="fields"
      :initial="initial"
      :fields-meta="fieldsMeta"
      :clean-form-value="cleanFormValue"
      :after-get-form-value="afterGetFormValue"
      :after-get-remote-meta="handleAfterGetRemoteMeta"
    />
  </div>
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { platformFieldsMeta, setAutomations } from './const'

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
        [this.$t('setting.Config'), [
          'protocols',
          'su_enabled', 'su_method'
        ]],
        [this.$t('common.Automations'), ['automation']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: platformFieldsMeta(this),
      url: `/api/v1/assets/platforms/`,
      cleanFormValue: (values) => {
        const protocols = values['protocols'] || []
        const query = this.$route.query || {}
        const automation = values['automation'] || {}
        const category_type = values['category_type']
        const ansibleConfig = automation?.['ansible_config']
        automation.ansible_config = ansibleConfig instanceof Object ? ansibleConfig : JSON.parse(ansibleConfig)

        if (query.hasOwnProperty('clone_from')) {
          if (automation.hasOwnProperty('id')) {
            delete automation['id']
          }
          values['protocols'] = protocols.map(i => {
            if (i.hasOwnProperty('id')) {
              delete i['id']
            }
            return i
          })
        }
        values['category'] = category_type[0]
        values['type'] = category_type[1]
        return values
      },
      afterGetFormValue: (obj) => {
        if (obj['category'] && obj['type']) {
          obj['category_type'] = [obj['category'].value, obj['type'].value]
        }
        return obj
      },
      defaultOptions: {}
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
    handleAfterGetRemoteMeta(meta) {
      this.fieldsMeta.su_method.options = meta?.su_method?.choices || []
    },
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
      this.defaultOptions = constraints

      const fieldsCheck = ['domain_enabled', 'su_enabled']
      for (const field of fieldsCheck) {
        const disabled = constraints[field] === false
        this.initial[field] = !disabled
        _.set(this.fieldsMeta, `${field}.el.disabled`, disabled)
      }
      this.fieldsMeta.protocols.el.choices = constraints['protocols'] || []

      if (constraints['charset_enabled'] === false) {
        this.fieldsMeta.charset.hidden = () => true
      }

      await setAutomations(this)
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

