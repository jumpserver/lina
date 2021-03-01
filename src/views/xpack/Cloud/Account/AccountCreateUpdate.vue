<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :initial="initial"
    :perform-submit="performSubmit"
    :after-get-form-value="afterGetFormValue"
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
        [this.$t(accountProviderAttrs.title), accountProviderAttrs.attrs],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        provider: {
          rules: [Required],
          el: {
            disabled: true
          }
        }
      },
      updateSuccessNextRoute: { name: 'CloudCenter' },
      createSuccessNextRoute: { name: 'CloudCenter' },
      afterGetFormValue(object) {
        const _object = {}
        Object.keys(object).forEach((key) => {
          // https://stackoverflow.com/questions/26222604/why-is-array-instanceof-object
          if (object[key] instanceof Object && !(object[key] instanceof Array)) {
            Object.keys(object[key]).forEach(innerKey => {
              _object[innerKey] = object[key][innerKey]
            })
          } else {
            _object[key] = object[key]
          }
        })
        return _object
      },
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
      const accountProvider = this.$route.query.provider || aliyun
      const accountProviderAttrs = ACCOUNT_PROVIDER_ATTRS_MAP[accountProvider]
      const attrs = {}
      for (const attr of accountProviderAttrs.attrs) {
        const v = validValues[attr]
        if (!v) {
          continue
        }
        attrs[attr] = v
      }
      validValues.attrs = attrs
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
