<template>
  <GenericCreateUpdateForm
    :fields="selectFields"
    :url="url"
    :initial="object"
    :update-success-next-route="successUrl"
    :clean-form-value="cleanFormValue"
    :object="object"
    :fields-meta="fieldsMeta"
    :get-method="getMethod"
  />
</template>
<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'

export default {
  name: 'Ldap',
  components: {
    GenericCreateUpdateForm
  },
  props: {
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      selectFields: ['AUTH_LDAP_SERVER_URI', 'AUTH_LDAP_BIND_DN', 'AUTH_LDAP_BIND_PASSWORD', 'AUTH_LDAP_SEARCH_OU',
        'AUTH_LDAP_SEARCH_FILTER', 'AUTH_LDAP_USER_ATTR_MAP', 'AUTH_LDAP'],
      successUrl: { name: 'Settings', params: { activeMenu: 'Email' }},
      fieldsMeta: {
        AUTH_LDAP_SERVER_URI: {
          label: this.$t('setting.authLdapServerUri'),
          rules: [
            { required: true }
          ]
        },
        AUTH_LDAP_BIND_DN: {
          label: this.$t('setting.authLdapBindDn')
        },
        AUTH_LDAP_BIND_PASSWORD: {
          label: this.$t('setting.authLdapBindPassword')
        },
        AUTH_LDAP_SEARCH_OU: {
          label: this.$t('setting.authLdapSearchOu'),
          helpText: this.$t('setting.helpText.authLdapSearchOu')
        },
        AUTH_LDAP_SEARCH_FILTER: {
          label: this.$t('setting.authLdapSearchFilter'),
          rules: [
            { required: true }
          ],
          helpText: this.$t('setting.helpText.authLdapSearchFilter')
        },
        AUTH_LDAP_USER_ATTR_MAP: {
          label: this.$t('setting.authLdapUserAttrMap'),
          el: {
            type: 'textarea'
          },
          rules: [
            { required: true }
          ],
          helpText: this.$t('setting.helpText.authLdapUserAttrMap')
        },
        AUTH_LDAP: {
          label: this.$t('setting.authLdap'),
          type: 'checkbox'
        }
      },
      url: '/api/v1/settings/setting/'
    }
  },
  methods: {
    cleanFormValue(data) {
      return {
        ldap: data
      }
    },
    getMethod() {
      return 'put'
    }
  }
}
</script>

<style scoped>

</style>
