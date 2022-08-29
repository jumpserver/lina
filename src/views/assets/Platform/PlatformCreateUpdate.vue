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
    <ProtocolSettingDialog
      :visible.sync="showDialog"
      :item="settingItem"
    />
  </div>
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import rules from '@/components/DataForm/rules'
import { assetFieldsMeta } from '@/views/assets/const'
import ProtocolSettingDialog from './ProtocolSettingDialog'

export default {
  name: 'PlatformCreateUpdate',
  components: {
    GenericCreateUpdatePage,
    ProtocolSettingDialog
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
      initial: {
        comment: '',
        charset: 'utf8',
        category_type: ['host', 'linux'],
        domain_enabled: false,
        protocols_enabled: false,
        verify_account_enabled: false,
        create_account_enabled: false,
        change_password_enabled: false,
        su_enabled: false
      },
      fields: [
        [this.$t('common.Basic'), [
          'name', 'category_type', 'charset'
        ]],
        [this.$t('assets.Protocol'), [
          'protocols_enabled', 'protocols'
        ]],
        [this.$t('assets.Domain'), [
          'domain_enabled', 'domain_default'
        ]],
        [this.$t('assets.Account'), [
          'su_enabled', 'su_method',
          'verify_account_enabled', 'verify_account_method',
          'create_account_enabled', 'create_account_method',
          'change_password_enabled', 'change_password_method'
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
          ...assetMeta.protocols,
          el: {
            choices: [],
            showSetting: (item) => true,
            onSettingClick: (item) => {
              this.settingItem = item
              this.showDialog = true
            },
            disableSetting: (item) => item.name !== 'rdp'
          },
          hidden: (formValue) => !formValue['protocols_enabled']
        },
        domain_enabled: {
          el: {
            disabled: false
          }
        },
        domain_default: {
          ...assetMeta.domain,
          hidden: (formValue) => !formValue['domain_enabled']
        },
        verify_account_method: {
          hidden: (formValue) => {
            return !formValue['verify_account_enabled']
          },
          type: 'select',
          options: []
        },
        create_account_method: {
          hidden: (formValue) => !formValue['create_account_enabled'],
          type: 'select',
          options: [],
          el: {}
        },
        change_password_method: {
          hidden: (formValue) => !formValue['change_password_enabled'],
          type: 'select',
          options: []
        },
        su_method: {
          hidden: (formValue) => !formValue['su_enabled'],
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
        obj['category_type'] = [obj['category'], obj['type']]
        this.setConstraints(obj['category'], obj['type'])
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
      const hasDomain = constraints['has_domain']
      this.fieldsMeta.domain_enabled.el.disabled = !hasDomain

      const protocols = constraints['protocols'] || []
      this.fieldsMeta.protocols_enabled.el.disabled = protocols.length === 0
      this.fieldsMeta.protocols.el.choices = protocols

      this.initial.protocols_enabled = !!protocols.length
      this.initial.domain_enabled = hasDomain
    },
    async setOpsMethods() {
      const category = this.$route.query.category
      const type = this.$route.query.type
      const allMethods = await this.$axios.get('/api/v1/assets/platforms/ops-methods/')
      const items = ['verify_account', 'change_password', 'create_account']
      for (const item of items) {
        const methods = allMethods.filter(method => {
          return method['category'] === category &&
            method['type'] === type &&
            method['method'] === item
        }).map(method => {
          return { value: method['id'], label: method['name'] }
        })
        this.fieldsMeta[item + '_method'].options = methods
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.platform-form >>> .el-form-item {
  .el-select {
    width: 100%;
  }
}

</style>

