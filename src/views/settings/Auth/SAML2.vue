<template>
  <BaseAuth
    :value="value"
    :config="settings"
    :title="$t('setting.SAML2')"
    enable-field="AUTH_SAML2"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { JsonRequired } from '@/components/DataForm/rules'
import { UploadKey } from '@/components'
import { JsonEditor } from '@/components/FormFields'

export default {
  name: 'SAML2',
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
        url: '/api/v1/settings/setting/?category=saml2',
        fields: [
          [this.$t('common.Basic'), ['AUTH_SAML2']],
          [this.$t('common.Certificate'), [
            'SAML2_SP_KEY_CONTENT',
            'SAML2_SP_CERT_CONTENT'
          ]],
          [this.$t('common.Params'), [
            'SAML2_IDP_METADATA_URL', 'SAML2_IDP_METADATA_XML',
            'SAML2_SP_ADVANCED_SETTINGS'
          ]],
          [this.$t('common.Other'), [
            'SAML2_LOGOUT_COMPLETELY', 'AUTH_SAML2_ALWAYS_UPDATE_USER',
            'SAML2_RENAME_ATTRIBUTES'
          ]]
        ],
        fieldsMeta: {
          AUTH_SAML2: {
            label: this.$t('setting.enableSAML2Auth')
          },
          SAML2_IDP_METADATA_URL: {
            component: 'el-input',
            label: this.$t('setting.authSAML2MetadataUrl'),
            helpText: this.$t('setting.IdpMetadataUrlHelpText')
          },
          SAML2_IDP_METADATA_XML: {
            component: 'el-input',
            el: {
              type: 'textarea',
              rows: 4
            },
            label: this.$t('setting.authSAML2Xml'),
            helpText: this.$t('setting.IdpMetadataHelpText')
          },
          SAML2_SP_ADVANCED_SETTINGS: {
            component: JsonEditor,
            label: this.$t('setting.authSAML2AdvancedSettings'),
            rules: [JsonRequired]
          },
          SAML2_SP_KEY_CONTENT: {
            component: UploadKey,
            helpText: this.$t('setting.authSAMLKeyHelpText')
          },
          SAML2_SP_CERT_CONTENT: {
            component: UploadKey,
            helpText: this.$t('setting.authSAMLCertHelpText') + ' <a href="/core/auth/saml2/metadata/" target="_blank">查看</a>'
          },
          SAML2_RENAME_ATTRIBUTES: {
            component: JsonEditor,
            label: this.$t('setting.authUserAttrMap'),
            rules: [JsonRequired],
            helpText: this.$t('setting.authUserAttrMapHelpText')
          }
        },
        submitMethod: () => 'patch',
        afterGetFormValue(obj) {
          obj.SAML2_RENAME_ATTRIBUTES = JSON.stringify(obj.SAML2_RENAME_ATTRIBUTES)
          obj.SAML2_SP_ADVANCED_SETTINGS = JSON.stringify(obj.SAML2_SP_ADVANCED_SETTINGS)
          return obj
        },
        cleanFormValue(data) {
          if (data['SAML2_RENAME_ATTRIBUTES']) {
            data['SAML2_SP_ADVANCED_SETTINGS'] = JSON.parse(data['SAML2_SP_ADVANCED_SETTINGS'])
            data['SAML2_RENAME_ATTRIBUTES'] = JSON.parse(data['SAML2_RENAME_ATTRIBUTES'])
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
