<template>
  <BaseAuth
    :config="settings"
    :title="$t('setting.OAuth2')"
    enable-field="AUTH_OAUTH2"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { JsonEditor } from '@/components/FormFields'
import { JsonRequired } from '@/components/DataForm/rules'
import { UploadField } from '@/components'
import { updateOAuth2Settings } from '@/api/settings'

export default {
  name: 'OAuth2',
  components: {
    BaseAuth
  },
  data() {
    const vm = this
    return {
      files: {},
      settings: {
        url: '/api/v1/settings/setting/?category=oauth2',
        fields: [
          [this.$t('common.Basic'), [
            'AUTH_OAUTH2',
            'AUTH_OAUTH2_LOGO_PATH',
            'AUTH_OAUTH2_LOGO_TITLE',
            'AUTH_OAUTH2_CLIENT_ID', 'AUTH_OAUTH2_CLIENT_SECRET',
            'AUTH_OAUTH2_ACCESS_TOKEN_METHOD'
          ]],
          [this.$t('common.Params'), [
            'AUTH_OAUTH2_SCOPE',
            'AUTH_OAUTH2_PROVIDER_AUTHORIZATION_ENDPOINT',
            'AUTH_OAUTH2_ACCESS_TOKEN_ENDPOINT',
            'AUTH_OAUTH2_PROVIDER_USERINFO_ENDPOINT'
          ]],
          [this.$t('common.Other'), [
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
                this.files['AUTH_OAUTH2_LOGO_PATH'] = value
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
        afterOnSubmit(values) {
          const form = new FormData()
          if (vm.files['AUTH_OAUTH2_LOGO_PATH']) {
            form.append('AUTH_OAUTH2_LOGO_PATH', vm.files['AUTH_OAUTH2_LOGO_PATH'])
            updateOAuth2Settings(form).then(res => { })
          }
        },
        afterGetFormValue(obj) {
          obj.AUTH_OAUTH2_USER_ATTR_MAP = JSON.stringify(obj.AUTH_OAUTH2_USER_ATTR_MAP)
          return obj
        },
        cleanFormValue(data) {
          if (data['AUTH_OAUTH2_USER_ATTR_MAP']) {
            data['AUTH_OAUTH2_USER_ATTR_MAP'] = JSON.parse(data['AUTH_OAUTH2_USER_ATTR_MAP'])
          }
          delete data['AUTH_OAUTH2_LOGO_PATH']
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
