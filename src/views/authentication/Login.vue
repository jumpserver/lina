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
import { SelectLanguage, AutoLogin, OtherAuthMethods } from './components'
import { redirectUrl } from '@/utils/common'
import { encryptPassword } from '@/utils/crypto'

export default {
  name: 'Login',
  components: {
    CentralForm
  },
  data() {
    return {
      fields: ['username', 'password', 'captcha', 'auto_login', 'has_captcha'],
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
        captcha: {
          hidden: (form) => { return !form.has_captcha }
        },
        has_captcha: {
          hidden: () => true
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
        extraMenu: OtherAuthMethods,
        submitButtonLoading: true,
        submitButtonCallback: (resp) => {
          redirectUrl(this.$router, resp?.redirect)
        }
      }
    }
  },
  mounted() {
    this.login_check()
  },
  methods: {
    async login_check() {
      let url = this.config.url
      const admin = this.$route.query?.admin
      if (admin) {
        url = `${url}?admin=${admin}`
      }
      const data = await this.$axios.get(url)
      redirectUrl(this.$router, data?.redirect)
    },
    cleanFormValue(value) {
      value['password'] = encryptPassword(value['password'])
      return value
    }
  }
}
</script>

<style scoped>

</style>
