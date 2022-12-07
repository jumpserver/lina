<template>
  <BaseAuth
    :config="settings"
    enable-field="AUTH_CAS"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { JsonRequiredUserNameMapped } from '@/components/DataForm/rules'
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
          [this.$t('common.Basic'), [
            'AUTH_CAS', 'CAS_SERVER_URL', 'CAS_ROOT_PROXIED_AS', 'CAS_VERSION'
          ]],
          [this.$t('common.Other'), [
            'CAS_LOGOUT_COMPLETELY', 'CAS_RENAME_ATTRIBUTES', 'CAS_CREATE_USER'
          ]]
        ],
        fieldsMeta: {
          CAS_RENAME_ATTRIBUTES: {
            component: JsonEditor,
            label: this.$t('setting.authUserAttrMap'),
            rules: [JsonRequiredUserNameMapped]
          }
        },
        submitMethod: () => 'patch',
        afterGetFormValue(obj) {
          obj.CAS_RENAME_ATTRIBUTES = JSON.stringify(obj.CAS_RENAME_ATTRIBUTES)
          return obj
        },
        cleanFormValue(data) {
          let userNameAttribute = ''
          const renameAttributes = JSON.parse(data['CAS_RENAME_ATTRIBUTES'])
          if (renameAttributes) {
            data['CAS_RENAME_ATTRIBUTES'] = renameAttributes
          }
          for (const key in renameAttributes) {
            if (renameAttributes[key] === 'username') {
              userNameAttribute = key
            }
          }
          data['CAS_USERNAME_ATTRIBUTE'] = userNameAttribute
          data['CAS_APPLY_ATTRIBUTES_TO_USER'] = true
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
