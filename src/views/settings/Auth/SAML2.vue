<template>
  <BaseAuth
    :config="settings"
    :title="$tc('SAML2')"
    enable-field="AUTH_SAML2"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { JsonRequired } from '@/components/Form/DataForm/rules'
import { UploadKey } from '@/components'
import { JsonEditor } from '@/components/Form/FormFields'

export default {
  name: 'SAML2',
  components: {
    BaseAuth
  },
  data() {
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=saml2',
        fields: [
          [this.$t('Basic'), ['AUTH_SAML2']],
          [this.$t('Certificate'), [
            'SAML2_SP_KEY_CONTENT',
            'SAML2_SP_CERT_CONTENT'
          ]],
          [this.$t('Params'), [
            'SAML2_IDP_METADATA_URL', 'SAML2_IDP_METADATA_XML',
            'SAML2_SP_ADVANCED_SETTINGS'
          ]],
          [this.$t('Other'), [
            'SAML2_LOGOUT_COMPLETELY', 'AUTH_SAML2_ALWAYS_UPDATE_USER',
            'SAML2_RENAME_ATTRIBUTES'
          ]]
        ],
        fieldsMeta: {
          SAML2_IDP_METADATA_URL: {
            component: 'el-input',
            helpText: this.$t('IdpMetadataUrlHelpText')
          },
          SAML2_IDP_METADATA_XML: {
            component: 'el-input',
            el: {
              type: 'textarea',
              rows: 4
            },
            helpText: this.$t('IdpMetadataHelpText')
          },
          SAML2_SP_ADVANCED_SETTINGS: {
            component: JsonEditor,
            rules: [JsonRequired]
          },
          SAML2_SP_KEY_CONTENT: {
            component: UploadKey,
            helpText: this.$t('AuthSAMLKeyHelpText')
          },
          SAML2_SP_CERT_CONTENT: {
            component: UploadKey,
            helpText: this.$t('AuthSAMLCertHelpText') + ' <a href="/core/auth/saml2/metadata/" target="_blank">查看</a>'
          },
          SAML2_RENAME_ATTRIBUTES: {
            component: JsonEditor,
            rules: [JsonRequired],
            helpText: this.$t('AuthSaml2UserAttrMapHelpText')
          }
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
