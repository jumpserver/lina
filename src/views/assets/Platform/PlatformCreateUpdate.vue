<template>
  <GenericCreateUpdatePage
    :url="url"
    :fields="fields"
    :initial="initial"
    :fields-meta="fieldsMeta"
    :clean-form-value="cleanFormValue"
    :after-get-form-value="afterGetFormValue"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import rules from '@/components/DataForm/rules'
import { assetFieldsMeta } from '@/views/assets/const'
export default {
  name: 'PlatformCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    const category = this.$route.query.category
    const type = this.$route.query.type
    const assetMeta = assetFieldsMeta()
    return {
      loading: true,
      initial: {
        comment: 'Hello world',
        charset: 'utf8',
        category_type: ['host', 'linux'],
        domain_enabled: false,
        protocols_enabled: false
      },
      fields: [
        [this.$t('common.Basic'), [
          'name', 'category_type', 'charset'
        ]],
        [this.$t('assets.Protocol'), [
          'protocols_enabled', 'protocols_default'
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
        meta: {
          fields: ['security', 'console'],
          fieldsMeta: {
            security: {
              prop: 'meta.security',
              type: 'select',
              label: 'RDP security',
              options: [{
                label: 'RDP',
                value: 'rdp'
              },
              {
                label: 'NLA',
                value: 'nla'
              },
              {
                label: 'TLS',
                value: 'tls'
              },
              {
                label: 'Any',
                value: 'any'
              }]
            },
            console: {
              type: 'select',
              label: 'RDP console',
              options: [{
                label: this.$t('common.Yes'),
                value: 'true'
              }, {
                label: this.$t('common.No'),
                value: 'false'
              }]
            }
          },
          hidden: form => form.base !== 'Windows'
        },
        category_type: {
          type: 'cascader',
          label: this.$t('assets.Type'),
          rules: [
            rules.Required
          ],
          el: {
            multiple: false,
            options: []
          },
          on: {
            change: ([event], updateForm) => {
              const category = event[0]
              const type = event[1]
              this.setLimits(category, type, updateForm)
            }
          }
        },
        protocols_enabled: {
          el: {
            disabled: false,
            value: false
          },
          value: false
        },
        protocols_default: {
          ...assetMeta.protocols,
          hidden: (formValue) => {
            console.log('formValue', formValue)
            return !formValue['protocols_enabled']
          }
        },
        domain_enabled: {
          value: true,
          el: {
            disabled: false
          }
        },
        domain_default: {
          ...assetMeta,
          hidden: (formValue) => {
            return !formValue['domain_enabled']
          }
        }.domain
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
        this.setLimits(obj['category'], obj['type'])
        return obj
      }
    }
  },
  mounted() {
    this.$store.dispatch('assets/getAssetCategories').then((state) => {
      this.fieldsMeta.category_type.el.options = state.assetCategoriesCascader
      this.setCategoryOnCreate()
    })
  },
  methods: {
    setCategoryOnCreate() {
      const category = this.$route.query.category
      const type = this.$route.query.type
      if (!category || !type) {
        return
      }
    },
    async setLimits(category, type, updateForm) {
      const url = `/api/v1/assets/platforms/type-constraints/?category=${category}&type=${type}`
      const constraints = await this.$axios.get(url)
      const hasDomain = constraints['has_domain']
      this.fieldsMeta.domain_enabled.el.disabled = !hasDomain

      const protocols = constraints['protocols'] || []
      this.fieldsMeta.protocols_enabled.el.disabled = protocols.length === 0
      this.fieldsMeta.protocols_default.el.choices = protocols

      if (updateForm) {
        updateForm({
          protocols_enabled: !!protocols.length,
          domain_enabled: hasDomain
        })
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
