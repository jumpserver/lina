<template>
  <div v-if="!loading" class="platform-form">
    <GenericCreateUpdatePage
      :after-get-form-value="afterGetFormValue"
      :after-get-remote-meta="handleAfterGetRemoteMeta"
      :clean-form-value="cleanFormValue"
      :fields="fields"
      :fields-meta="fieldsMeta"
      :has-detail-in-msg="false"
      :has-reset="false"
      :initial="initial"
      :url="url"
    />
  </div>
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { platformFieldsMeta, setAutomations, updateAutomationParams } from './const'

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
      suMethodLimits: [],
      suMethods: [],
      initial: {
        comment: '',
        charset: 'utf-8',
        category_type: ['host', 'linux'],
        automation: {
          ansible_enabled: true
        }
      },
      fields: [
        [this.$t('common.Basic'), [
          'name', 'category_type', 'charset',
          'domain_enabled'
        ]],
        [this.$t('setting.Config'), [
          'protocols', 'su_enabled', 'su_method'
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
        const ansibleConfig = automation?.['ansible_config'] || {}
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
        updateAutomationParams(this, obj)
        if (obj['category'] && obj['type']) {
          obj['category_type'] = [obj['category'].value, obj['type'].value]
        }
        obj.protocols = obj.protocols?.map(i => {
          if (i.name === 'http') {
            i.display_name = 'http(s)'
          }
          return i
        })
        return obj
      },
      defaultOptions: {}
    }
  },
  watch: {
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
    updateSuMethodOptions() {
      const options = this.suMethods.filter(i => {
        return this.suMethodLimits.includes(i.value)
      })
      this.fieldsMeta.su_method.options = options
      if (options.length > 0) {
        this.initial.su_method = options[0]?.value
      }
    },
    handleAfterGetRemoteMeta(meta) {
      this.suMethods = meta?.su_method?.choices || []
      this.updateSuMethodOptions()
    },
    async updateSuMethods(constrains) {
      this.suMethodLimits = constrains['su_methods'] || []
      this.updateSuMethodOptions()
      this.initial.su_method = this.suMethodLimits[0]
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
      let protocols = constraints?.protocols || []
      protocols = protocols?.map(i => {
        if (i.name === 'http') {
          i.display_name = 'http(s)'
        }
        return i
      })
      this.fieldsMeta.protocols.el.choices = protocols

      for (const field of fieldsCheck) {
        const disabled = constraints[field] === false
        this.initial[field] = !disabled
        _.set(this.fieldsMeta, `${field}.el.disabled`, disabled)
      }

      if (constraints['charset_enabled'] === false) {
        this.fieldsMeta.charset.hidden = () => true
      }
      await setAutomations(this)
      await this.updateSuMethods(constraints)
    }
  }
}
</script>

<style lang='scss' scoped>
.platform-form >>> {
  .el-cascader {
    width: 100%;
  }
}

>>> .itemMethodKey.el-form-item {
  display: inline-block;
  width: 100%;
  .el-form-item__content {
    width: 70%;
  }
  .el-select {
    width: 100%;
  }
}

>>> .itemParamsKey.el-form-item {
  display: inline-block;
  position: absolute;
  right: 20px;
}
</style>

