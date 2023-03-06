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
  name: 'Login',
  components: {
    CentralForm
  },
  data() {
    return {
      fields: ['username', 'password'],
      fieldsMeta: {
        code: {
          label: this.$t('users.Captcha'),
          component: Captcha
        }
      },
      config: {
        url: '/api/v1/authentication/password/forget/previewing/',
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
