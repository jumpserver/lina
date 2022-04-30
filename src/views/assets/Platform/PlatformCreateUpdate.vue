<template>
  <div>
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
  components: { GenericCreateUpdatePage },
  data() {
    return {
      loading: true,
      initial: {
        console: 'true',
        security: 'RDP',
        comment: 'Hello world',
        charset: 'utf8',
        category_type: ['host', 'linux']
      },
      fields: [
        [this.$t('common.Basic'), [
          'name', 'category_type', 'charset', 'meta'
        ]],
        [this.$t('assets.Defaults'), [
          'domain_enabled', 'domain_default',
          'protocols_enabled', 'protocols_default',
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
            options: []
          }
        },
        domain_default: assetFieldsMeta.domain,
        admin_user_default: assetFieldsMeta.admin_user
      },
      url: '/api/v1/assets/platforms/',
      cleanFormValue: (values) => {
        const category_type = values['category_type']
        values['category'] = category_type[0]
        values['type'] = category_type[1]
        // delete values['category_type']
        return values
      },
      afterGetFormValue: (obj) => {
        obj['category_type'] = [obj['category'], obj['type']]
        return obj
      }
    }
  },
  mounted() {
    this.$axios.get('/api/v1/assets/platforms/categories/').then(data => {
      const options = data.map((item) => {
        const children = item.children.map(this.toOption)
        const option = this.toOption(item)
        option.children = children
        return option
      })
      this.fieldsMeta.category_type.el.options = options
      this.loading = false
    })
  },
  methods: {
    toOption(choice) {
      return {
        label: choice['display_name'],
        value: choice['value']
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
