<template>
  <BaseAuth
    :config="settings"
    enable-field="AUTH_OPENID"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { JsonEditor, UpdateToken } from '@/components/Form/FormFields'
import { JsonRequired } from '@/components/Form/DataForm/rules'
import { getOrgSelect2Meta } from '@/views/settings/Auth/const'
import _ from 'lodash'
export default {
  name: 'OIDC',
  components: {
    BaseAuth
  },
  data() {
    const vm = this
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=oidc',
        encryptedFields: ['AUTH_OPENID_CLIENT_SECRET'],
        fields: [
          [this.$t('Basic'), [
            'AUTH_OPENID', 'BASE_SITE_URL', 'AUTH_OPENID_CLIENT_ID',
            'AUTH_OPENID_CLIENT_SECRET', 'AUTH_OPENID_CLIENT_AUTH_METHOD'
          ]],
          [this.$t('Server'), [
            'AUTH_OPENID_KEYCLOAK', 'AUTH_OPENID_SERVER_URL', 'AUTH_OPENID_REALM_NAME',
            'AUTH_OPENID_PROVIDER_ENDPOINT', 'AUTH_OPENID_PROVIDER_AUTHORIZATION_ENDPOINT',
            'AUTH_OPENID_PROVIDER_TOKEN_ENDPOINT', 'AUTH_OPENID_PROVIDER_JWKS_ENDPOINT',
            'AUTH_OPENID_PROVIDER_USERINFO_ENDPOINT', 'AUTH_OPENID_PROVIDER_END_SESSION_ENDPOINT',
            'AUTH_OPENID_PROVIDER_SIGNATURE_ALG', 'AUTH_OPENID_PROVIDER_SIGNATURE_KEY',
            'AUTH_OPENID_PKCE', 'AUTH_OPENID_CODE_CHALLENGE_METHOD',
            'AUTH_OPENID_SCOPES', 'AUTH_OPENID_ID_TOKEN_MAX_AGE', 'AUTH_OPENID_ID_TOKEN_INCLUDE_CLAIMS',
            'AUTH_OPENID_USE_STATE', 'AUTH_OPENID_USE_NONCE', 'AUTH_OPENID_ALWAYS_UPDATE_USER',
            'AUTH_OPENID_IGNORE_SSL_VERIFICATION', 'AUTH_OPENID_SHARE_SESSION'
          ]],
          [this.$t('Search'), [
            'AUTH_OPENID_USER_ATTR_MAP'
          ]],
          [this.$t('Other'), [
            'OPENID_ORG_IDS'
          ]]
        ],
        fieldsMeta: {
          AUTH_OPENID_CLIENT_SECRET: {
            component: UpdateToken
          },
          AUTH_OPENID_SERVER_URL: {
            hidden: (form) => !form['AUTH_OPENID_KEYCLOAK']
          },
          AUTH_OPENID_REALM_NAME: {
            hidden: (form) => !form['AUTH_OPENID_KEYCLOAK']
          },
          AUTH_OPENID_PROVIDER_ENDPOINT: {
            helpTextAsTip: false,
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK'],
            on: {
              input: _.debounce(function([value], updateForm) {
                if (value.endsWith('/')) {
                  value = value.slice(0, -1)
                }
                vm.onProviderEndpointChange(value, updateForm)
              }, 1000)
            }
          },
          AUTH_OPENID_PROVIDER_AUTHORIZATION_ENDPOINT: {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK']
          },
          AUTH_OPENID_PROVIDER_TOKEN_ENDPOINT: {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK']
          },
          AUTH_OPENID_PROVIDER_JWKS_ENDPOINT: {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK']
          },
          AUTH_OPENID_PROVIDER_USERINFO_ENDPOINT: {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK']
          },
          AUTH_OPENID_PROVIDER_END_SESSION_ENDPOINT: {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK']
          },
          AUTH_OPENID_PROVIDER_SIGNATURE_ALG: {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK']
          },
          AUTH_OPENID_PROVIDER_SIGNATURE_KEY: {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK']
          },
          AUTH_OPENID_PKCE: {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK']
          },
          AUTH_OPENID_CODE_CHALLENGE_METHOD: {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK'] || !form['AUTH_OPENID_PKCE']
          },
          'AUTH_OPENID_SCOPES': {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK']
          },
          'AUTH_OPENID_ID_TOKEN_MAX_AGE': {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK']
          },
          'AUTH_OPENID_ID_TOKEN_INCLUDE_CLAIMS': {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK']
          },
          'AUTH_OPENID_USE_STATE': {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK']
          },
          'AUTH_OPENID_USE_NONCE': {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK']
          },
          'AUTH_OPENID_IGNORE_SSL_VERIFICATION': {
          },
          'AUTH_OPENID_SHARE_SESSION': {
          },
          'AUTH_OPENID_USER_ATTR_MAP': {
            component: JsonEditor,
            rules: [JsonRequired]
          },
          OPENID_ORG_IDS: getOrgSelect2Meta()
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
    async onProviderEndpointChange(value, updateForm) {
      let data = {}
      try {
        data = await this.discovery(value)
      } catch (err) {
        data = this.setDefault(value)
      }
      updateForm(data)
    },
    async discovery(issuer, updateForm) {
      if (!issuer.startsWith('http')) {
        throw new Error('Invalid issuer')
      }
      const url = `${issuer}/.well-known/openid-configuration`
      const config = {
        ignoreSSLVerification: true,
        disableFlashErrorMsg: true
      }
      const configMap = {
        AUTH_OPENID_PROVIDER_AUTHORIZATION_ENDPOINT: 'authorization_endpoint',
        AUTH_OPENID_PROVIDER_TOKEN_ENDPOINT: 'token_endpoint',
        AUTH_OPENID_PROVIDER_JWKS_ENDPOINT: 'jwks_uri',
        AUTH_OPENID_PROVIDER_USERINFO_ENDPOINT: 'userinfo_endpoint',
        AUTH_OPENID_PROVIDER_END_SESSION_ENDPOINT: 'end_session_endpoint'
      }
      try {
        const res = await this.$axios.get(url, config)
        const data = {}
        for (const [k, v] of Object.entries(configMap)) {
          data[k] = res[v]
        }
        if (Object.keys(data).length < 5) {
          throw new Error('Invalid issuer, missing required fields')
        }
        return data
      } catch (err) {
        throw err
      }
    },
    setDefault(issuer) {
      const fields = {
        AUTH_OPENID_PROVIDER_AUTHORIZATION_ENDPOINT: 'authorize',
        AUTH_OPENID_PROVIDER_TOKEN_ENDPOINT: 'token',
        AUTH_OPENID_PROVIDER_JWKS_ENDPOINT: 'jwks',
        AUTH_OPENID_PROVIDER_USERINFO_ENDPOINT: 'userinfo',
        AUTH_OPENID_PROVIDER_END_SESSION_ENDPOINT: 'logout'
      }
      const data = {}
      for (const [k, v] of Object.entries(fields)) {
        data[k] = issuer + '/' + v
      }
      return data
    }
  }
}
</script>

<style scoped>

</style>
