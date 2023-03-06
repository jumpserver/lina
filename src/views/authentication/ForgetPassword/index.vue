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
        code: {
          label: this.$t('users.Captcha'),
          component: Captcha
        }
      },
      config: {
        url: '/api/v1/authentication/password/forget/previewing/',
        subTitle: '请输入您需要找回密码的用户名',
        btnCallback: (resp) => {
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
