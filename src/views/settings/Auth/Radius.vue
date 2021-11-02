<template>
  <BaseAuth
    :value="value"
    :config="settings"
    :title="$t('setting.Radius')"
    enable-field="AUTH_RADIUS"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { UpdateToken } from '@/components/FormFields'

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
        url: '/api/v1/settings/setting/?category=radius',
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
