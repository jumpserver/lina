<template>
  <CentralForm
    :fields="fields"
    :fields-meta="fieldsMeta"
    :config="config"
  />
</template>

<script>
import { CentralForm } from '@/components'
import { SelectLanguage, AutoLogin, OtherAuthMethods } from './components'

export default {
  name: 'Login',
  components: {
    CentralForm
  },
  data() {
    return {
      fields: ['username', 'password', 'auto_login'],
      fieldsMeta: {
        username: {
          label: '',
          el: {
            placeholder: this.$t('auth.Username')
          }
        },
        password: {
          label: '',
          el: {
            placeholder: this.$t('auth.Password')
          }
        },
        auto_login: {
          label: '',
          component: AutoLogin
        }
      },
      config: {
        url: '/api/v1/authentication/login/',
        rightImageUrl: '/static/img/login_image.png',
        subMenu: SelectLanguage,
        btnTitle: this.$t('route.Login'),
        extraMenu: OtherAuthMethods
      }
    }
  }
}
</script>

<style scoped>

</style>
