<template>
  <BaseAuth v-model="value" :title="$t('setting.Radius')">
    <GenericCreateUpdateForm v-bind="settings" />
  </BaseAuth>
</template>

<script>
import BaseAuth from './Base'
import { GenericCreateUpdateForm } from '@/layout/components'
export default {
  name: 'Cas',
  components: {
    BaseAuth,
    GenericCreateUpdateForm
  },
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      visible: false,
      settings: {
        url: '/api/v1/settings/setting/?category=radius',
        fields: [
          [this.$t('common.Basic'), ['AUTH_RADIUS', 'RADIUS_SERVER', 'RADIUS_PORT', 'RADIUS_SECRET']],
          [this.$t('common.Other'), ['OTP_IN_RADIUS']]
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
