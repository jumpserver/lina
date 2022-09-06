<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :initial="initial"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { Required, specialEmojiCheck } from '@/components/DataForm/rules'
import { ACCOUNT_PROVIDER_ATTRS_MAP, aliyun } from '../const'
import { UploadKey } from '@/components'
import { encryptPassword } from '@/utils/crypto'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    const accountProvider = this.$route.query.provider || aliyun
    const accountProviderAttrs = ACCOUNT_PROVIDER_ATTRS_MAP[accountProvider]
    function setFieldAttrs() {
      const fieldsObject = {}
      const updateNotRequiredFields = ['access_key_secret', 'client_secret', 'password', 'sc_password', 'oc_password', 'cert_file', 'key_file']
      for (const item of accountProviderAttrs?.attrs) {
        fieldsObject[item] = {
          rules: updateNotRequiredFields.includes(item) && vm.$route.params.id ? [] : [Required]
        }
      }
      return fieldsObject
    }
    return {
      initial: {
        attrs: {
          ip_group: []
        },
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
        name: {
          rules: [Required, specialEmojiCheck]
        },
        attrs: {
          encryptedFields: ['access_key_secret'],
          fields: accountProviderAttrs.attrs,
          fieldsMeta: {
            // 必须放在最上面，下面特殊制定的字段才会覆盖默认
            ...setFieldAttrs(),
            service_account_key: {
              label: this.$t('xpack.Cloud.ServerAccountKey'),
              component: UploadKey,
              el: {
                toFormat: 'object'
              }
            },
            cert_file: {
              label: this.$t('common.Certificate'),
              component: UploadKey,
              el: {
                toFormat: 'object'
              }
            },
            key_file: {
              label: this.$t('common.SecretKey'),
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
      },
      cleanFormValue(values) {
        const encryptedFields = [
          'access_key_secret', 'password', 'client_secret',
          'oc_password', 'sc_password'
        ]
        const attrs = values.attrs
        for (const item of encryptedFields) {
          const value = attrs[item]
          if (!value) {
            continue
          }
          attrs[item] = encryptPassword(value)
        }
        const toListFields = ['ip_group']
        for (const item of toListFields) {
          let value = attrs[item]
          if (!value) {
            continue
          }
          value = value?.split(',') || []
          value = value.filter((value, index) => { if (value) return true })
          attrs[item] = value
        }
        return values
      },
      afterGetFormValue(formValue) {
        if (!formValue.attrs) {
          return formValue
        }
        if (Array.isArray(formValue.attrs.ip_group)) {
          formValue.attrs.ip_group = formValue.attrs.ip_group.toString()
        }
        return formValue
      }
    }
  },
  methods: {
  }
}

</script>

<style lang="less" scoped>
</style>
