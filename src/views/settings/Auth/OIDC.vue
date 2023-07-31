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

export default {
  name: 'OIDC',
  components: {
    BaseAuth
  },
  data() {
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=oidc',
        encryptedFields: ['AUTH_OPENID_CLIENT_SECRET'],
        fields: [
          [this.$t('common.Basic'), [
            'AUTH_OPENID', 'BASE_SITE_URL', 'AUTH_OPENID_CLIENT_ID',
            'AUTH_OPENID_CLIENT_SECRET', 'AUTH_OPENID_CLIENT_AUTH_METHOD'
          ]],
          [this.$t('common.Params'), [
            'AUTH_OPENID_KEYCLOAK', 'AUTH_OPENID_SERVER_URL', 'AUTH_OPENID_REALM_NAME',
            'AUTH_OPENID_PROVIDER_ENDPOINT', 'AUTH_OPENID_PROVIDER_AUTHORIZATION_ENDPOINT',
            'AUTH_OPENID_PROVIDER_TOKEN_ENDPOINT', 'AUTH_OPENID_PROVIDER_JWKS_ENDPOINT',
            'AUTH_OPENID_PROVIDER_USERINFO_ENDPOINT', 'AUTH_OPENID_PROVIDER_END_SESSION_ENDPOINT',
            'AUTH_OPENID_PROVIDER_SIGNATURE_ALG', 'AUTH_OPENID_PROVIDER_SIGNATURE_KEY',
            'AUTH_OPENID_PKCE', 'AUTH_OPENID_CODE_CHALLENGE_METHOD',
            'AUTH_OPENID_SCOPES', 'AUTH_OPENID_ID_TOKEN_MAX_AGE', 'AUTH_OPENID_ID_TOKEN_INCLUDE_CLAIMS',
            'AUTH_OPENID_USE_STATE', 'AUTH_OPENID_USE_NONCE', 'AUTH_OPENID_ALWAYS_UPDATE_USER',
            'AUTH_OPENID_IGNORE_SSL_VERIFICATION', 'AUTH_OPENID_SHARE_SESSION', 'AUTH_OPENID_USER_ATTR_MAP'
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
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK'],
            on: {
              input([value], updateForm) {
                const fields = {
                  AUTH_OPENID_PROVIDER_AUTHORIZATION_ENDPOINT: 'authorize',
                  AUTH_OPENID_PROVIDER_TOKEN_ENDPOINT: 'token',
                  AUTH_OPENID_PROVIDER_JWKS_ENDPOINT: 'jwks',
                  AUTH_OPENID_PROVIDER_USERINFO_ENDPOINT: 'userinfo',
                  AUTH_OPENID_PROVIDER_END_SESSION_ENDPOINT: 'logout'
                }
                for (const [k, v] of Object.entries(fields)) {
                  const data = {}
                  data[k] = value + v
                  updateForm(data)
                }
              }
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
          'AUTH_OPENID_ALWAYS_UPDATE_USER': {
            hidden: (form) => form['AUTH_OPENID_KEYCLOAK']
          },
          'AUTH_OPENID_IGNORE_SSL_VERIFICATION': {
          },
          'AUTH_OPENID_SHARE_SESSION': {
          },
          'AUTH_OPENID_USER_ATTR_MAP': {
            component: JsonEditor,
            label: this.$t('setting.authLdapUserAttrMap'),
            rules: [JsonRequired]
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
  }
}
</script>

<style scoped>

</style>
