<template>
  <BaseAuth
    :config="settings"
    enable-field="AUTH_CERT"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'

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
          'AUTH_CERT',
          'AUTH_CERT_ENROLL_ENABLED',
          'AUTH_CERT_ENROLL_VALIDITY_DAYS',
          'AUTH_CERT_CHALLENGE_TTL',
          'AUTH_CERT_DEFAULT_PIN'
        ],
        fieldsMeta: {
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
