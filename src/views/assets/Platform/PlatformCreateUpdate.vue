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
        category_type: ['host', 'linux']
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
        [this.$t('assets.Auth'), [
          'admin_user_enabled', 'admin_user_default'
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
            options: this.$store.state.assets.assetCategoriesCascader
          },
          on: {
            change: ([event], formValue) => {
              const category = event[0]
              const type = event[1]
              this.setLimits(category, type)
            }
          }
        },
        admin_user_default: {
          ...assetMeta.admin_user,
          hidden: (formValue) => {
            return !formValue['admin_user_enabled']
          }
        },
        protocols_enabled: {
          el: {
            disabled: false
          }
        },
        protocols_default: {
          ...assetMeta.protocols,
          hidden: (formValue) => {
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
    this.setCategoryOnCreate()
  },
  methods: {
    setCategoryOnCreate() {
      const category = this.$route.query.category
      const type = this.$route.query.type
      if (!category || !type) {
        return
      }
    },
    toOption(choice) {
      return {
        label: choice['display_name'],
        value: choice['value']
      }
    },
    async setLimits(category, type) {
      const url = `/api/v1/assets/platforms/type-limits/?category=${category}&type=${type}`
      const limits = await this.$axios.get(url)
      const hasDomain = limits['has_domain']
      const protocolLimits = limits['protocols_limit']
      this.fieldsMeta.domain_enabled.el.disabled = !hasDomain
      this.fieldsMeta.domain_enabled.value = !!hasDomain

      this.fieldsMeta.protocols_enabled.el.disabled = protocolLimits.length === 0
      this.fieldsMeta.protocols_default.el.choices = protocolLimits
    }
  }
}
</script>

<style lang='less' scoped>

</style>
