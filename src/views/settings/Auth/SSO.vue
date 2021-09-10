<template>
  <BaseAuth
    :value="value"
    :config="settings"
    :title="$t('setting.SSO')"
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
  props: {
    value: {
      type: Boolean,
      required: true
    }
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
