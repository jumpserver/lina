<template>
  <BaseAuth
    :config="settings"
    enable-field="AUTH_SSO"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
export default {
  name: 'SSO',
  components: {
    BaseAuth
  },
  data() {
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=sso',
        fields: [
          [
            this.$t('common.Basic'), ['AUTH_SSO', 'AUTH_SSO_AUTHKEY_TTL']
          ]
        ],
        submitMethod: () => 'patch'
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
