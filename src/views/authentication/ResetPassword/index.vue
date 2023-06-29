<template>
  <CentralForm
    :fields="fields"
    :fields-meta="fieldsMeta"
    :config="config"
    :clean-form-value="cleanFormValue"
  />
</template>

<script>
import { CentralForm } from '@/components'
import { redirectUrl } from '@/utils/common'
import { encryptPassword } from '@/utils/crypto'

export default {
  name: 'ResetPassword',
  components: {
    CentralForm
  },
  data() {
    return {
      fields: ['new_password', 'confirm_password'],
      fieldsMeta: {
        new_password: {
          el: {
            placeholder: this.$t('users.NewPassword')
          }
        },
        confirm_password: {
          el: {
            placeholder: this.$t('users.ConfirmPassword')
          }
        }
      },
      config: {
        url: this.getUrl(),
        submitButtonCallback: (resp) => {
          redirectUrl(this.$router, resp?.redirect)
        }
      }
    }
  },
  methods: {
    getUrl() {
      const baseUrl = '/api/v1/authentication/password/reset/'
      return `${baseUrl}?token=${this.$route.query?.token}`
    },
    cleanFormValue(value) {
      value['new_password'] = encryptPassword(value['new_password'])
      value['confirm_password'] = encryptPassword(value['confirm_password'])
      return value
    }
  }
}
</script>

<style lang="less" scoped>
</style>
