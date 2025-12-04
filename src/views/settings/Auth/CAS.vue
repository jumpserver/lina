<template>
  <BaseAuth
    :config="settings"
    enable-field="AUTH_CAS"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { JsonRequiredUserNameMapped } from '@/components/Form/DataForm/rules'
import { JsonEditor } from '@/components/Form/FormFields'
import { getOrgSelect2Meta } from '@/views/settings/Auth/const'

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
          [this.$t('Basic'), [
            'AUTH_CAS', 'CAS_SERVER_URL', 'CAS_ROOT_PROXIED_AS', 'CAS_VERSION'
          ]],
          [this.$t('Search'), [
            'CAS_RENAME_ATTRIBUTES'
          ]],
          [this.$t('Other'), [
            'CAS_ORG_IDS', 'CAS_LOGOUT_COMPLETELY'
          ]]
        ],
        fieldsMeta: {
          CAS_RENAME_ATTRIBUTES: {
            component: JsonEditor,
            rules: [JsonRequiredUserNameMapped]
          },
          CAS_ORG_IDS: getOrgSelect2Meta()
        },
        submitMethod: () => 'patch',
        afterGetFormValue(obj) {
          return obj
        },
        cleanFormValue(data) {
          let userNameAttribute = ''
          const renameAttributes = data['CAS_RENAME_ATTRIBUTES']
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
