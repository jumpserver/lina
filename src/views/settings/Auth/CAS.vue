<template>
  <BaseAuth
    :config="settings"
    enable-field="AUTH_CAS"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { JsonRequired } from '@/components/DataForm/rules'
import { JsonEditor } from '@/components/FormFields'

export default {
  name: 'Cas',
  components: {
    BaseAuth
  },
  data() {
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=cas',
        fields: [
          [this.$t('common.Basic'), ['AUTH_CAS', 'CAS_SERVER_URL', 'CAS_ROOT_PROXIED_AS', 'CAS_VERSION']],
          [this.$t('common.Other'), [
            'CAS_LOGOUT_COMPLETELY', 'CAS_USERNAME_ATTRIBUTE',
            'CAS_APPLY_ATTRIBUTES_TO_USER', 'CAS_RENAME_ATTRIBUTES',
            'CAS_CREATE_USER'
          ]]
        ],
        fieldsMeta: {
          CAS_RENAME_ATTRIBUTES: {
            component: JsonEditor,
            label: this.$t('setting.authUserAttrMap'),
            rules: [JsonRequired]
          }
        },
        submitMethod: () => 'patch',
        afterGetFormValue(obj) {
          obj.CAS_RENAME_ATTRIBUTES = JSON.stringify(obj.CAS_RENAME_ATTRIBUTES)
          return obj
        },
        cleanFormValue(data) {
          if (data['CAS_RENAME_ATTRIBUTES']) {
            data['CAS_RENAME_ATTRIBUTES'] = JSON.parse(data['CAS_RENAME_ATTRIBUTES'])
          }
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
