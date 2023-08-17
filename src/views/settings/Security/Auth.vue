<template>
  <IBox>
    <GenericCreateUpdateForm submit-method="patch" v-bind="config" />
  </IBox>
</template>

<script>
import IBox from '@/components/IBox/index.vue'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'

export default {
  name: 'Auth',
  components: { GenericCreateUpdateForm, IBox },
  data() {
    return {
      config: {
        url: '/api/v1/settings/setting/?category=security_auth',
        fields: [
          [
            this.$t('common.Basic'),
            [
              'SECURITY_LOGIN_CAPTCHA_ENABLED',
              'SECURITY_LOGIN_CHALLENGE_ENABLED',
              'SECURITY_UNCOMMON_USERS_TTL',
              'SECURITY_CHECK_DIFFERENT_CITY_LOGIN'
            ]
          ],
          [
            'MFA',
            [
              'SECURITY_MFA_AUTH',
              'SECURITY_MFA_IN_LOGIN_PAGE',
              'SECURITY_MFA_AUTH_ENABLED_FOR_THIRD_PARTY',
              'SECURITY_MFA_VERIFY_TTL',
              'OTP_ISSUER_NAME', 'OTP_VALID_WINDOW'
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
          VERIFY_CODE_TTL: {
            label: this.$t('setting.ExpirationTimeout')
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
