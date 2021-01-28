<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="selectFields"
      :url="url"
      :fields-meta="fieldsMeta"
      :get-method="getMethod"
      :more-buttons="moreButtons"
      :has-detail-in-msg="false"
      :after-get-form-value="changeFormValue"
      :clean-form-value="cleanFormValue"
    />
    <ImportDialog :show.sync="dialogLdapUserImport" />
    <TestLoginDialog :show.sync="dialogTest" />
  </IBox>
</template>
<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { testLdapSetting } from '@/api/settings'
import ImportDialog from './ImportDialog'
import TestLoginDialog from './TestLoginDialog'
import { IBox } from '@/components'

export default {
  name: 'Ldap',
  components: {
    GenericCreateUpdateForm,
    IBox,
    ImportDialog,
    TestLoginDialog
  },
  data() {
    return {
      loading: true,
      object: {},
      dialogTest: false,
      dialogLdapUserImport: false,
      selectFields: [
        [
          this.$t('setting.LDAPServerInfo'),
          [
            'AUTH_LDAP_SERVER_URI', 'AUTH_LDAP_BIND_DN', 'AUTH_LDAP_BIND_PASSWORD'
          ]
        ],
        [
          this.$t('setting.LDAPUser'),
          [
            'AUTH_LDAP_SEARCH_OU', 'AUTH_LDAP_SEARCH_FILTER', 'AUTH_LDAP_USER_ATTR_MAP'
          ]
        ],
        [
          this.$t('common.Other'),
          [
            'AUTH_LDAP'
          ]
        ]
      ],
      fieldsMeta: {
        AUTH_LDAP_USER_ATTR_MAP: {
          el: {
            type: 'textarea'
          }
        }
      },
      url: '/api/v1/settings/setting/?category=ldap',
      moreButtons: [
        {
          title: this.$t('setting.ldapConnectTest'),
          callback: function(value, form) {
            if (value['AUTH_LDAP_BIND_PASSWORD'] === undefined) {
              value['AUTH_LDAP_BIND_PASSWORD'] = ''
            }
            testLdapSetting(value).then(resp => {
              this.$message.success(resp)
            }).catch(err => {
              const response = err.response
              this.$message.error(response.data)
            })
          }.bind(this)
        },
        {
          title: this.$t('setting.ldapLoginTest'),
          callback: function(value, form) {
            this.dialogTest = true
          }.bind(this)
        },
        {
          title: this.$t('setting.ldapBulkImport'),
          callback: function(value, form) {
            this.dialogLdapUserImport = true
          }.bind(this)
        }
      ]
    }
  },
  mounted() {
    this.loading = false
  },
  methods: {
    getMethod() {
      return 'put'
    },
    changeFormValue(obj) {
      obj.AUTH_LDAP_USER_ATTR_MAP = JSON.stringify(obj.AUTH_LDAP_USER_ATTR_MAP)
      return obj
    },
    cleanFormValue(data) {
      if (data['AUTH_LDAP_BIND_PASSWORD'] === '') {
        delete data['AUTH_LDAP_BIND_PASSWORD']
      }
      if (data['AUTH_LDAP_USER_ATTR_MAP']) {
        data['AUTH_LDAP_USER_ATTR_MAP'] = JSON.parse(data['AUTH_LDAP_USER_ATTR_MAP'])
      }
      return data
    }
  }
}
</script>

<style scoped>
.listTable ::v-deep .table-action-right-side{
  padding-top: 0px !important;
}

</style>
