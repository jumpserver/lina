<template>
  <BaseAuth
    :config="settings"
    enable-field="AUTH_PASSKEY"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'

export default {
  name: 'Passkey',
  components: {
    BaseAuth
  },
  data() {
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=passkey',
        hasDetailInMsg: false,
        fields: [
          [
            this.$t('common.BasicInfo'),
            [
              'AUTH_PASSKEY', 'FIDO_SERVER_ID', 'FIDO_SERVER_NAME'
            ]
          ]
        ],
        fieldsMeta: {
        },
        submitMethod() {
          return 'patch'
        }
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
