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
    const category = this.$route.query.category
    const type = this.$route.query.type
    const assetMeta = assetFieldsMeta()
    return {
      loading: true,
      showDialog: false,
      settingItem: {
        setting: {},
        name: '',
        port: 0
      },
      opsItems: [
        'gather_facts_enabled', 'create_account_enabled',
        'change_password_enabled', 'verify_account_enabled',
        'gather_accounts_enabled', 'su_enabled'
      ],
      initial: {
        comment: '',
        charset: 'utf8',
        category_type: ['host', 'linux']
      },
      fields: [
        [this.$t('common.Basic'), [
          'name', 'category_type'
        ]],
        [this.$t('assets.Asset'), [
          'charset',
          'protocols_enabled', 'protocols',
          'gather_facts_enabled', 'gather_facts_method'
        ]],
        [this.$t('assets.Account'), [
          'su_enabled', 'su_method',
          'create_account_enabled', 'create_account_method',
          'verify_account_enabled', 'verify_account_method',
          'change_password_enabled', 'change_password_method',
          'gather_accounts_enabled', 'gather_accounts_method'
        ]],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        category_type: {
          type: 'cascader',
          label: this.$t('assets.Type'),
          rules: [
            rules.Required
          ],
          el: {
            multiple: false,
            options: [],
            disabled: true
          },
          hidden: (formValue) => {
            if (formValue.category_type[0] === undefined) {
              formValue.category_type = this.initial.category_type
            }
          }
        },
        protocols_enabled: {
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
        verify_account_method: {
          type: 'select',
          options: []
        },
        change_password_method: {
          type: 'select',
          options: []
        },
        su_method: {
          type: 'select'
        }
      },
      url: `/api/v1/assets/platforms/?category=${category}&type=${type}`,
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
      await this.setOpsMethods()
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
      return new Promise((resolve, reject) => resolve(true))
    },
    async setConstraints() {
      const category = this.$route.query.category
      const type = this.$route.query.type
      const url = `/api/v1/assets/platforms/type-constraints/?category=${category}&type=${type}`
      const constraints = await this.$axios.get(url)

      const protocols = constraints['protocols'] || []
      this.fieldsMeta.protocols_enabled.el.disabled = protocols.length === 0
      this.fieldsMeta.protocols.el.choices = protocols
      this.initial.protocols_enabled = !!protocols.length

      for (const itemOk of this.opsItems) {
        const itemConstraint = constraints[itemOk]
        const itemMethod = itemOk.replace('_enabled', '_method')
        if (itemConstraint === false) {
          _.set(this.fieldsMeta, `${itemOk}.el.disabled`, true)
        }
        if (!this.fieldsMeta[itemMethod]?.hidden) {
          _.set(this.fieldsMeta, `${itemMethod}.hidden`, (formValue) => !formValue[itemOk])
        }
        // set default value
        if (this.initial[itemOk] === undefined) {
          this.initial[itemOk] = false
        }
        if (_.get(this.fieldsMeta, `${itemMethod}.type`) === undefined) {
          _.set(this.fieldsMeta, `${itemMethod}.type`, 'select')
        }
      }
    },
    async setOpsMethods() {
      const category = this.$route.query.category
      const type = this.$route.query.type
      const allMethods = await this.$axios.get('/api/v1/assets/platforms/ops-methods/')
      for (const itemOk of this.opsItems) {
        const item = itemOk.replace('_enabled', '')
        const methods = allMethods.filter(method => {
          const ok = method['method'] === item && method['category'] === category
          const tpOk = method['type'].indexOf(type) > -1 ||
            method['type'].indexOf('all') > -1
          return ok & tpOk
        }).map(method => {
          return { value: method['id'], label: method['name'] }
        })
        if (methods.length > 0) {
          this.fieldsMeta[`${itemOk.replace('_enabled', '_method')}`].options = methods
        }
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.platform-form >>> .el-form-item {
  .el-select:not(.prepend) {
    width: 100%;
  }
}
</style>

