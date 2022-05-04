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
    return {
      loading: true,
      initial: {
        comment: 'Hello world',
        charset: 'utf8'
        // category_type: ['host', 'linux']
      },
      fields: [
        [this.$t('common.Basic'), [
          'name', 'category_type', 'charset'
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
          // disabled: true,
          rules: [
            rules.Required
          ],
          el: {
            multiple: false,
            options: this.$store.state.assets.assetCategoriesCascader
          }
        },
        domain_default: assetFieldsMeta.domain,
        admin_user_default: assetFieldsMeta.admin_user,
        protocols_default: assetFieldsMeta.protocols
      },
      url: `/api/v1/assets/platforms/?category=${category}&type=${type}`,
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
    }
  }
}
</script>

<style lang='less' scoped>

</style>
