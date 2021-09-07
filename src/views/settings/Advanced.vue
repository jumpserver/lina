<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'

export default {
  name: 'Senior',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    return {
      url: '/api/v1/settings/setting/?category=advanced',
      hasDetailInMsg: false,
      fields: [
        [
          this.$t('setting.Ldap'),
          [
            'AUTH_LDAP_CONNECT_TIMEOUT', 'AUTH_LDAP_SEARCH_PAGED_SIZE',
            'AUTH_LDAP_SYNC_IS_PERIODIC', 'AUTH_LDAP_SYNC_CRONTAB', 'AUTH_LDAP_SYNC_INTERVAL',
            'AUTH_LDAP_USER_LOGIN_ONLY_IN_USERS'
          ]
        ],
        [
          this.$t('common.OpenId'),
          [
            'AUTH_OPENID', 'BASE_SITE_URL', 'AUTH_OPENID_CLIENT_ID', 'AUTH_OPENID_CLIENT_SECRET', 'AUTH_OPENID_SHARE_SESSION', 'AUTH_OPENID_IGNORE_SSL_VERIFICATION',
            'AUTH_OPENID_PROVIDER_ENDPOINT', 'AUTH_OPENID_PROVIDER_AUTHORIZATION_ENDPOINT', 'AUTH_OPENID_PROVIDER_TOKEN_ENDPOINT', 'AUTH_OPENID_PROVIDER_JWKS_ENDPOINT',
            'AUTH_OPENID_PROVIDER_USERINFO_ENDPOINT', 'AUTH_OPENID_PROVIDER_END_SESSION_ENDPOINT', 'AUTH_OPENID_PROVIDER_SIGNATURE_ALG', 'AUTH_OPENID_PROVIDER_SIGNATURE_KEY',
            'AUTH_OPENID_SCOPES', 'AUTH_OPENID_ID_TOKEN_MAX_AGE', 'AUTH_OPENID_ID_TOKEN_INCLUDE_CLAIMS', 'AUTH_OPENID_USE_STATE', 'AUTH_OPENID_USE_NONCE', 'AUTH_OPENID_ALWAYS_UPDATE_USER',
            'AUTH_OPENID_SERVER_URL', 'AUTH_OPENID_REALM_NAME'
          ]
        ],
        [
          this.$t('common.Radius'),
          [
            'AUTH_RADIUS', 'RADIUS_SERVER', 'RADIUS_PORT', 'RADIUS_SECRET', 'RADIUS_ENCRYPT_PASSWORD', 'OTP_IN_RADIUS'
          ]
        ],
        [
          this.$t('common.Cas'),
          [
            'AUTH_CAS', 'CAS_SERVER_URL', 'CAS_LOGOUT_COMPLETELY', 'CAS_VERSION', 'CAS_USERNAME_ATTRIBUTE', 'CAS_APPLY_ATTRIBUTES_TO_USER', 'CAS_RENAME_ATTRIBUTES', 'CAS_CREATE_USER'
          ]
        ],
        [
          this.$t('common.other'),
          [
            'AUTH_SSO', 'AUTH_SSO_AUTHKEY_TTL', 'OTP_VALID_WINDOW', 'OTP_ISSUER_NAME',
            'SECURITY_LOGIN_CHALLENGE_ENABLED', 'SECURITY_LOGIN_CAPTCHA_ENABLED', 'SECURITY_INSECURE_COMMAND_LEVEL'
          ]
        ]
      ],
      fieldsMeta: {
        AUTH_LDAP_SYNC_CRONTAB: {
          label: this.$t('xpack.RegularlyPerform'),
          helpText: this.$t('xpack.HelpText.CrontabOfCreateUpdatePage')
        }
      },
      submitMethod() {
        return 'put'
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
