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
          'AUTH_CERT'
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
