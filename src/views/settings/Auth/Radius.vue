<template>
  <BaseAuth
    :config="settings"
    enable-field="AUTH_RADIUS"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { UpdateToken } from '@/components/Form/FormFields'

export default {
  name: 'Cas',
  components: {
    BaseAuth
  },
  data() {
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=radius',
        encryptedFields: ['RADIUS_SECRET'],
        fields: [
          [this.$t('common.Basic'), ['AUTH_RADIUS', 'RADIUS_SERVER', 'RADIUS_PORT', 'RADIUS_SECRET']],
          [this.$t('common.Other'), ['OTP_IN_RADIUS']]
        ],
        fieldsMeta: {
          RADIUS_SECRET: {
            component: UpdateToken
          }
        },
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
