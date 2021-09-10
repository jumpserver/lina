<template>
  <BaseAuth
    :value="value"
    :config="settings"
    :title="$t('setting.CASSetting')"
    enable-field="AUTH_CAS"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
export default {
  name: 'Cas',
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
        url: '/api/v1/settings/setting/?category=cas',
        fields: [
          [this.$t('common.Basic'), ['AUTH_CAS', 'CAS_SERVER_URL', 'CAS_VERSION']],
          [this.$t('common.Other'), [
            'CAS_LOGOUT_COMPLETELY', 'CAS_USERNAME_ATTRIBUTE',
            'CAS_APPLY_ATTRIBUTES_TO_USER', 'CAS_RENAME_ATTRIBUTES',
            'CAS_CREATE_USER'
          ]]
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
