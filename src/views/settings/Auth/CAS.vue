<template>
  <BaseAuth v-model="value" :title="$t('setting.CASSetting')">
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
