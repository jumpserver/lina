<template>
  <BaseAuth :config="settings" enable-field="AUTH_UKEY" v-on="$listeners" />
</template>

<script>
import BaseAuth from './Base'
import { UploadKey } from '@/components'
import TextReadonly from '@/components/Form/FormFields/TextReadonly.vue'

export default {
  name: 'UKey',
  components: {
    BaseAuth
  },
  data() {
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=ukey',
        fields: [
          [this.$t('Basic'), ['AUTH_UKEY', 'AUTH_UKEY_CHALLENGE_TTL', 'AUTH_UKEY_DEFAULT_PIN']],
          [
            this.$t('Enrollment'),
            [
              'AUTH_UKEY_ENROLL_ENABLED',
              'AUTH_UKEY_CA_CERT_ALGORITHM',
              'AUTH_UKEY_CA_CERT_CONTENT',
              'AUTH_UKEY_CA_KEY_CONTENT',
              'AUTH_UKEY_CA_KEY_PASS',
              'AUTH_UKEY_ENROLL_VALIDITY_DAYS'
            ]
          ]
        ],
        fieldsMeta: {
          AUTH_UKEY_ENROLL_VALIDITY_DAYS: {
            hidden: (form) => !form['AUTH_UKEY_ENROLL_ENABLED']
          },
          AUTH_UKEY_CA_CERT_CONTENT: {
            component: UploadKey,
            hidden: (form) => !form['AUTH_UKEY_ENROLL_ENABLED']
          },
          AUTH_UKEY_CA_CERT_ALGORITHM: {
            component: TextReadonly,
            el: {
              bolder: false
            },
            hidden: (form) => !form['AUTH_UKEY_ENROLL_ENABLED']
          },
          AUTH_UKEY_CA_KEY_CONTENT: {
            component: UploadKey,
            hidden: (form) => !form['AUTH_UKEY_ENROLL_ENABLED']
          },
          AUTH_UKEY_CA_KEY_PASS: {
            hidden: (form) => !form['AUTH_UKEY_ENROLL_ENABLED']
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
    onConfirm() {}
  }
}
</script>

<style scoped></style>
