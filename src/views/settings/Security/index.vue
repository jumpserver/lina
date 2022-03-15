<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :submit-method="submitMethod"
    :has-detail-in-msg="false"
  />
</template>
<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import PasswordRule from './PasswordRule'
import AuthLimit from './AuthLimit'

export default {
  name: 'Security',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      fields: [
        [
          this.$t('common.Basic'),
          [
            'SECURITY_COMMAND_EXECUTION',
            'SECURITY_SERVICE_ACCOUNT_REGISTRATION',
            'SECURITY_MAX_IDLE_TIME',
            'SECURITY_WATERMARK_ENABLED',
            'SECURITY_SESSION_SHARE'
          ]
        ],
        [
          this.$t('common.Auth'),
          [
            'SECURITY_MFA_AUTH',
            'SECURITY_MFA_IN_LOGIN_PAGE',
            'SECURITY_MFA_AUTH_ENABLED_FOR_THIRD_PARTY',
            'SECURITY_LOGIN_CHALLENGE_ENABLED',
            'SECURITY_LOGIN_CAPTCHA_ENABLED',
            'SECURITY_PASSWORD_EXPIRATION_TIME',
            'SECURITY_MFA_VERIFY_TTL',
            'SECURITY_CHECK_DIFFERENT_CITY_LOGIN',
            'AuthLimit',
            'PasswordRule'
          ]
        ]
      ],
      fieldsMeta: {
        SECURITY_LOGIN_CHALLENGE_ENABLED: {
          on: {
            change: ([val], updateForm) => {
              if (val) {
                updateForm({ SECURITY_MFA_IN_LOGIN_PAGE: false })
                updateForm({ SECURITY_LOGIN_CAPTCHA_ENABLED: false })
              }
            }
          }
        },
        SECURITY_MFA_IN_LOGIN_PAGE: {
          hidden: (form) => {
            return form['SECURITY_MFA_AUTH'] !== 1 || !this.$store.getters.hasValidLicense
          },
          on: {
            change: ([val], updateForm) => {
              if (val) {
                updateForm({ SECURITY_LOGIN_CHALLENGE_ENABLED: false })
                updateForm({ SECURITY_LOGIN_CAPTCHA_ENABLED: false })
              }
            }
          }
        },
        SECURITY_LOGIN_CAPTCHA_ENABLED: {
          on: {
            change: ([val], updateForm) => {
              if (val) {
                updateForm({ SECURITY_LOGIN_CHALLENGE_ENABLED: false })
                updateForm({ SECURITY_MFA_IN_LOGIN_PAGE: false })
              }
            }
          }
        },
        PasswordRule: {
          label: this.$t('setting.PasswordCheckRule'),
          component: PasswordRule
        },
        AuthLimit: {
          label: this.$t('setting.AuthLimit'),
          component: AuthLimit
        }
      },
      url: '/api/v1/settings/setting/?category=security'
    }
  },
  methods: {
    submitMethod() {
      return 'patch'
    }
  }
}
</script>

<style scoped>

</style>
