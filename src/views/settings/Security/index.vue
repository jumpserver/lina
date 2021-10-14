<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :url="url"
      :fields-meta="fieldsMeta"
      :submit-method="submitMethod"
      :has-detail-in-msg="false"
      @submitSuccess="onSubmitSuccess()"
    />
  </IBox>
</template>
<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import PasswordRule from './PasswordRule'
import AuthLimit from './AuthLimit'
import { IBox } from '@/components'
import { Link } from '@/components/FormFields'

export default {
  name: 'Security',
  components: {
    GenericCreateUpdateForm,
    IBox
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
            'SECURITY_LOGIN_CHALLENGE_ENABLED',
            'SECURITY_LOGIN_CAPTCHA_ENABLED',
            'SECURITY_PASSWORD_EXPIRATION_TIME',
            'OLD_PASSWORD_HISTORY_LIMIT_COUNT',
            'SECURITY_MFA_VERIFY_TTL',
            'LOGIN_CONFIRM_ENABLE',
            'AuthLimit',
            'PasswordRule'
          ]
        ],
        [
          this.$t('setting.InsecureCommandAlert'),
          [
            'SECURITY_INSECURE_COMMAND_EMAIL_RECEIVER'
          ]
        ]
      ],
      fieldsMeta: {
        SECURITY_INSECURE_COMMAND_EMAIL_RECEIVER: {
          component: Link,
          helpText: this.$t('setting.InsecureCommandNotifyToSubscription'),
          label: this.$t('common.Receivers'),
          el: {
            href: '/ui/#/settings?activeTab=SysMessageSub',
            title: this.$t('setting.insecureCommandEmailUpdate')
          }
        },
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
            return form.SECURITY_MFA_AUTH !== 1
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
        LOGIN_CONFIRM_ENABLE: {
          hidden: () => {
            return !this.$store.getters.hasValidLicense
          }
        },
        SECURITY_WATERMARK_ENABLED: {
          hidden: () => {
            return !this.$store.getters.hasValidLicense
          }
        },
        PasswordRule: {
          label: this.$t('setting.PasswordCheckRule'),
          component: PasswordRule
        },
        AuthLimit: {
          label: this.$t('setting.AuthLimit'),
          component: AuthLimit,
          hidden: () => {
            return !this.$store.getters.hasValidLicense
          }
        }
      },
      url: '/api/v1/settings/setting/?category=security'
    }
  },
  methods: {
    submitMethod() {
      return 'patch'
    },
    onSubmitSuccess() {
      window.location.reload()
    }
  }
}
</script>

<style scoped>

</style>
