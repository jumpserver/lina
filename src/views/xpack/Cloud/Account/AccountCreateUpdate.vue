<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :initial="initial"
    :perform-submit="performSubmit"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { Required } from '@/components/DataForm/rules'
import { ACCOUNT_PROVIDER_ATTRS_MAP, aliyun } from '../const'

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
          fields: accountProviderAttrs.attrs
        },
        provider: {
          rules: [Required],
          el: {
            disabled: true
          }
        }
      },
      updateSuccessNextRoute: { name: 'AccountList' },
      createSuccessNextRoute: { name: 'AccountList' },
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
    performSubmit(validValues) {
      const method = this.getMethod()
      return this.$axios[method](`${this.getUrl()}`, validValues)
    },
    getMethod() {
      const params = this.$route.params
      if (params.id) {
        return 'put'
      } else {
        return 'post'
      }
    }
  }
}

</script>

<style lang="less" scoped>
</style>
