<template>
  <BaseAuth v-model="value" :title="$t('setting.SSO')">
    <GenericCreateUpdateForm v-bind="settings" />
  </BaseAuth>
</template>

<script>
import BaseAuth from './Base'
import { GenericCreateUpdateForm } from '@/layout/components'
export default {
  name: 'SSO',
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
