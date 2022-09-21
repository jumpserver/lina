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
import rules from '@/components/DataForm/rules'
import { assetFieldsMeta } from '@/views/assets/const'

export default {
  name: 'PlatformCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    const assetMeta = assetFieldsMeta()
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
        automation: {}
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
      fieldsMeta: {
        automation: {
          initial: {},
          fields: [
            'ping_enabled', 'ping_method',
            'gather_facts_enabled', 'gather_facts_method',
            'create_account_enabled', 'create_account_method',
            'change_password_enabled', 'change_password_method',
            'verify_account_enabled', 'verify_account_method'
          ],
          fieldsMeta: {
            ping_method: {},
            gather_facts_method: {},
            create_account_method: {},
            change_password_method: {},
            verify_account_method: {}
          }
        },
        category_type: {
          type: 'cascader',
          label: this.$t('assets.Type'),
          rules: [
            rules.Required
          ],
          el: {
            multiple: false,
            options: [],
            props: {
              label: 'name',
              value: 'id'
            },
            disabled: true
          },
          remote: {
            request: () => vm.$axios.get('/api/v1/assets/categories/')
          },
          hidden: (formValue) => {
            if (formValue.category_type[0] === undefined) {
              formValue.category_type = this.initial.category_type
            }
          }
        },
        brand: {},
        protocols_enabled: {
          el: {
            disabled: false
          }
        },
        domain_enabled: {
          el: {
            disabled: false
          }
        },
        protocols: {
          label: '支持的协议',
          ...assetMeta.protocols,
          el: {
            choices: []
          },
          hidden: (formValue) => !formValue['protocols_enabled']
        },
        su_method: {
          type: 'select'
        }
      },
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
          this.initial[field] = !disabled
        }
        _.set(this.fieldsMeta, `${field}.el.disabled`, disabled)
      }
      this.fieldsMeta.protocols.el.choices = constraints['protocols'] || []
      await this.setAutomations(constraints['automation'])
    },
    async setAutomations(automation) {
      const autoFieldsMeta = this.fieldsMeta.automation.fieldsMeta
      const autoFields = this.fieldsMeta.automation.fields
        .filter(item => item.endsWith('_method'))
        .map(item => item.replace('_method', ''))

      const initial = this.initial.automation || {}
      for (const item of autoFields) {
        const itemEnabled = item + '_enabled'
        const itemMethod = item + '_method'
        const itemConstraint = automation[itemEnabled]
        // 设置隐藏和disabled
        if (itemConstraint === false) {
          _.set(autoFieldsMeta, `${itemEnabled}.el.disabled`, true)
        }
        if (!autoFieldsMeta[itemMethod]?.hidden) {
          initial[itemEnabled] = false
          _.set(autoFieldsMeta, `${itemMethod}.hidden`, (formValue) => !formValue[itemEnabled])
        }
        // 设置 method 类型和 options
        if (_.get(autoFieldsMeta, `${itemMethod}.type`) === undefined) {
          _.set(autoFieldsMeta, `${itemMethod}.type`, 'select')
        }
        const methods = automation[itemMethod + 's'] || []
        autoFieldsMeta[itemMethod].options = methods.map(method => {
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

