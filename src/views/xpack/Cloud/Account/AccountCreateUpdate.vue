<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :initial="initial"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { Required } from '@/components/DataForm/rules'
import { ACCOUNT_PROVIDER_ATTRS_MAP, aliyun } from '../const'
import { UploadKey } from '@/components'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const accountProvider = this.$route.query.provider || aliyun
    const accountProviderAttrs = ACCOUNT_PROVIDER_ATTRS_MAP[accountProvider]
    return {
      initial: {
        provider: this.$route.query.provider,
        port: 443
      },
      url: '/api/v1/xpack/cloud/accounts/',
      fields: [
        [this.$t('common.Basic'), ['name', 'provider']],
        [this.$t(accountProviderAttrs.title), ['attrs']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        attrs: {
          fields: accountProviderAttrs.attrs,
          fieldsMeta: {
            service_account_key: {
              label: this.$t('xpack.Cloud.ServerAccountKey'),
              component: UploadKey,
              el: {
                toFormat: 'object'
              }
            },
            password: {
              rules: this.$route.params.id ? [] : [Required]
            }
          }
        },
        provider: {
          rules: [Required],
          el: {
            disabled: true
          }
        }
      },
      updateSuccessNextRoute: { name: 'CloudCenter', params: { activeMenu: 'AccountList' }},
      createSuccessNextRoute: { name: 'CloudCenter', params: { activeMenu: 'AccountList' }},
      getUrl() {
        const params = this.$route.params
        let url = `/api/v1/xpack/cloud/accounts/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return `${url}?provider=${accountProvider}`
      }
    }
  },
  computed: {
  },
  methods: {
  }
}

</script>

<style lang="less" scoped>
</style>
