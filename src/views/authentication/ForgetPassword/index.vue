<template>
  <CentralForm
    :fields="fields"
    :fields-meta="fieldsMeta"
    :config="config"
  />
</template>

<script>
import { CentralForm } from '@/components'
import { Captcha } from '@/components/FormFields'

export default {
  name: 'ForgetPasswordPreviewing',
  components: {
    CentralForm
  },
  data() {
    return {
      fields: ['username', 'code'],
      fieldsMeta: {
        username: {
          label: '',
          el: {
            placeholder: this.$t('auth.Username')
          }
        },
        code: {
          label: '',
          component: Captcha
        }
      },
      config: {
        url: '/api/v1/authentication/password/forget/previewing/',
        subTitle: this.$t('auth.HelpText.Username'),
        submitButtonCallback: (resp) => {
          this.$router.push({
            path: `/authentication/forget-password/auth-step/?token=${resp?.token}`
          })
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
