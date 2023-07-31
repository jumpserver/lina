<template>
  <BaseAuth
    :config="settings"
    :title="$tc('setting.OAuth2')"
    enable-field="AUTH_OAUTH2"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { JsonEditor } from '@/components/Form/FormFields'
import { JsonRequired } from '@/components/Form/DataForm/rules'
import { UploadField } from '@/components'
import request from '@/utils/request'

export default {
  name: 'OAuth2',
  components: {
    BaseAuth
  },
  data() {
    const vm = this
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=oauth2',
        fields: [
          [this.$t('common.Basic'), [
            'AUTH_OAUTH2',
            'AUTH_OAUTH2_PROVIDER',
            'AUTH_OAUTH2_LOGO_PATH',
            'AUTH_OAUTH2_CLIENT_ID', 'AUTH_OAUTH2_CLIENT_SECRET',
            'AUTH_OAUTH2_ACCESS_TOKEN_METHOD'
          ]],
          [this.$t('common.Params'), [
            'AUTH_OAUTH2_SCOPE',
            'AUTH_OAUTH2_PROVIDER_AUTHORIZATION_ENDPOINT',
            'AUTH_OAUTH2_ACCESS_TOKEN_ENDPOINT',
            'AUTH_OAUTH2_PROVIDER_USERINFO_ENDPOINT',
            'AUTH_OAUTH2_PROVIDER_END_SESSION_ENDPOINT'
          ]],
          [this.$t('common.Other'), [
            'AUTH_OAUTH2_LOGOUT_COMPLETELY',
            'AUTH_OAUTH2_ALWAYS_UPDATE_USER',
            'AUTH_OAUTH2_USER_ATTR_MAP'
          ]]
        ],
        fieldsMeta: {
          AUTH_OAUTH2_LOGO_PATH: {
            component: UploadField,
            el: {
              width: '5%',
              height: '5%',
              tip: this.$t('setting.OAuth2LogoTip')
            },
            on: {
              fileChange: ([value], updateForm) => {
                vm.updateOAuth2Logo(value)
              }
            }
          },
          AUTH_OAUTH2_USER_ATTR_MAP: {
            component: JsonEditor,
            label: this.$t('setting.authUserAttrMap'),
            rules: [JsonRequired],
            helpText: this.$t('setting.authUserAttrMapHelpText')
          },
          AUTH_OAUTH2_ACCESS_TOKEN_METHOD: {
            label: this.$t('setting.tokenHTTPMethod')
          }
        },
        submitMethod: () => 'patch',
        afterGetFormValue(obj) {
          return obj
        },
        cleanFormValue(data) {
          delete data['AUTH_OAUTH2_LOGO_PATH']
          return data
        }
      }
    }
  },
  methods: {
    updateOAuth2Logo(file) {
      const formData = new FormData()
      formData.append('AUTH_OAUTH2_LOGO_PATH', file)
      return request({
        url: '/api/v1/settings/setting/?category=oauth2',
        method: 'patch',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData
      })
    }
  }
}
</script>

<style scoped>

</style>
