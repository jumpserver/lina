<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
    <ImportDialog v-if="dialogLdapUserImport" :visible.sync="dialogLdapUserImport" />
    <TestLoginDialog :visible.sync="dialogTest" />
    <SyncSettingDialog :visible.sync="dialogSyncSetting" />
  </IBox>
</template>
<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'
import ImportDialog from './ImportDialog.vue'
import TestLoginDialog from './TestLoginDialog.vue'
import SyncSettingDialog from './SyncSettingDialog.vue'
import { IBox } from '@/components'
import rules, { JsonRequired } from '@/components/Form/DataForm/rules'
import { JsonEditor, UpdateToken } from '@/components/Form/FormFields'

export default {
  name: 'Ldap',
  components: {
    GenericCreateUpdateForm,
    IBox,
    ImportDialog,
    TestLoginDialog,
    SyncSettingDialog
  },
  data() {
    return {
      dialogTest: false,
      dialogLdapUserImport: false,
      dialogSyncSetting: false,
      encryptedFields: ['AUTH_LDAP_BIND_PASSWORD'],
      fields: [
        [
          this.$t('common.Basic'),
          [
            'AUTH_LDAP', 'AUTH_LDAP_SERVER_URI',
            'AUTH_LDAP_BIND_DN', 'AUTH_LDAP_BIND_PASSWORD'
          ]
        ],
        [
          this.$t('setting.LDAPUser'),
          [
            'AUTH_LDAP_SEARCH_OU', 'AUTH_LDAP_SEARCH_FILTER',
            'AUTH_LDAP_USER_ATTR_MAP'
          ]
        ],
        [
          this.$t('common.Other'),
          [
            'AUTH_LDAP_CONNECT_TIMEOUT', 'AUTH_LDAP_SEARCH_PAGED_SIZE',
            'AUTH_LDAP_CACHE_TIMEOUT'
          ]
        ]
      ],
      fieldsMeta: {
        AUTH_LDAP_BIND_DN: {
          rules: [
            rules.Required
          ]
        },
        AUTH_LDAP_BIND_PASSWORD: {
          component: UpdateToken
        },
        AUTH_LDAP_SEARCH_OU: {
          rules: [
            rules.Required
          ]
        },
        AUTH_LDAP_USER_ATTR_MAP: {
          component: JsonEditor,
          label: this.$t('setting.authLdapUserAttrMap'),
          rules: [JsonRequired]
        }
      },
      url: '/api/v1/settings/setting/?category=ldap',
      hasDetailInMsg: false,
      moreButtons: [
        {
          title: this.$t('setting.ldapConnectTest'),
          loading: false,
          callback: function(value, form, btn) {
            if (value['AUTH_LDAP_BIND_PASSWORD'] === undefined) {
              value['AUTH_LDAP_BIND_PASSWORD'] = ''
            }
            btn.loading = true
            this.enableWS()
            this.ws.onopen = (e) => {
              this.ws.send(JSON.stringify({ msg_type: 'testing_config', ...value }))
            }
            this.ws.onmessage = (e) => {
              const data = JSON.parse(e.data)
              if (data.ok) {
                this.$message.success(data.msg)
              } else {
                this.$message.error(data.msg)
              }
              btn.loading = false
            }
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
        },
        {
          title: this.$t('setting.SyncSetting'),
          callback: function(value, form) {
            this.dialogSyncSetting = true
          }.bind(this)
        }
      ],
      submitMethod: () => 'patch',
      afterGetFormValue(obj) {
        return obj
      },
      cleanFormValue(data) {
        if (data['AUTH_LDAP_BIND_PASSWORD'] === '') {
          delete data['AUTH_LDAP_BIND_PASSWORD']
        }
        return data
      }
    }
  },
  mounted() {
    // this.loading = false
  },
  methods: {
    enableWS() {
      const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws'
      const port = document.location.port ? ':' + document.location.port : ''
      const url = '/ws/ldap/'
      const wsURL = scheme + '://' + document.location.hostname + port + url
      this.ws = new WebSocket(wsURL)
    }
  }
}
</script>

<style scoped>
.listTable ::v-deep .table-action-right-side {
  padding-top: 0 !important;
}

</style>
