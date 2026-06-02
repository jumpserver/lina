<template>
  <BaseAuth
    :config="settings"
    enable-field="AUTH_CERT"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { UploadKey } from '@/components'
import TextReadonly from '@/components/Form/FormFields/TextReadonly.vue'

export default {
  name: 'Cert',
  components: {
    BaseAuth
  },
  data() {
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=cert',
        fields: [
          [this.$t('Basic'), [
            'AUTH_CERT',
            'AUTH_CERT_CHALLENGE_TTL',
            'AUTH_CERT_DEFAULT_PIN'
          ]],
          [this.$t('Enrollment'), [
            'AUTH_CERT_ENROLL_ENABLED',
            'AUTH_CERT_ENROLL_VALIDITY_DAYS',
            'AUTH_CERT_CA_CERT_CONTENT',
            'AUTH_CERT_CA_CERT_ALGORITHM',
            'AUTH_CERT_CA_KEY_CONTENT',
            'AUTH_CERT_CA_KEY_PASS'
          ]]
        ],
        fieldsMeta: {
          AUTH_CERT_ENROLL_VALIDITY_DAYS: {
            hidden: (form) => !form['AUTH_CERT_ENROLL_ENABLED']
          },
          AUTH_CERT_CA_CERT_CONTENT: {
            component: UploadKey,
            hidden: (form) => !form['AUTH_CERT_ENROLL_ENABLED']
          },
          AUTH_CERT_CA_CERT_ALGORITHM: {
            component: TextReadonly,
            el: {
              bolder: false
            },
            hidden: (form) => !form['AUTH_CERT_ENROLL_ENABLED']
          },
          AUTH_CERT_CA_KEY_CONTENT: {
            component: UploadKey,
            hidden: (form) => !form['AUTH_CERT_ENROLL_ENABLED']
          },
          AUTH_CERT_CA_KEY_PASS: {
            hidden: (form) => !form['AUTH_CERT_ENROLL_ENABLED']
          }
        },
        submitMethod: () => 'patch',
        afterGetFormValue(obj) {
          return obj
        },
        cleanFormValue(data) {
          return data
        }
      }
    }
  },
  methods: {
    onConfirm() {
    }
  }
}
</script>

<style scoped>

</style>
