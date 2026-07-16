<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
    <ImportDialog
      v-if="dialogLdapUserImport"
      v-model:visible="dialogLdapUserImport"
      :category="category"
    />
    <TestLoginDialog v-model:visible="dialogTest" :category="category" />
    <SyncSettingDialog v-if="dialogSyncSetting" v-model:visible="dialogSyncSetting" />
  </IBox>
</template>
<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'
import ImportDialog from './ImportDialog.vue'
import TestLoginDialog from './TestLoginDialog.vue'
import SyncSettingDialog from './SyncSettingDialog.vue'
import { IBox, UploadKey } from '@/components'
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
    const category = 'ldap'
    const isLdaps = (formValue = {}) => {
      const serverUri = formValue.AUTH_LDAP_SERVER_URI || ''
      return serverUri.trim().toLowerCase().startsWith('ldaps://')
    }
    return {
      category: category,
      url: `/api/v1/settings/setting/?category=${category}`,
      dialogTest: false,
      dialogLdapUserImport: false,
      dialogSyncSetting: false,
      encryptedFields: [
        'AUTH_LDAP_BIND_PASSWORD',
        'AUTH_LDAP_CACERT_CONTENT',
        'AUTH_LDAP_CERT_CONTENT',
        'AUTH_LDAP_KEY_CONTENT'
      ],
      fields: [
        [
          this.$t('Basic'),
          [
            'AUTH_LDAP',
            'AUTH_LDAP_SERVER_URI',
            'AUTH_LDAP_BIND_DN',
            'AUTH_LDAP_BIND_PASSWORD',
            'AUTH_LDAP_START_TLS',
            'AUTH_LDAP_CACERT_CONTENT',
            'AUTH_LDAP_CERT_CONTENT',
            'AUTH_LDAP_KEY_CONTENT'
          ]
        ],
        [
          this.$t('Search'),
          ['AUTH_LDAP_SEARCH_OU', 'AUTH_LDAP_SEARCH_FILTER', 'AUTH_LDAP_USER_ATTR_MAP']
        ],
        [
          this.$t('Other'),
          [
            'AUTH_LDAP_STRICT_SYNC',
            'AUTH_LDAP_CONNECT_TIMEOUT',
            'AUTH_LDAP_SEARCH_PAGED_SIZE',
            'AUTH_LDAP_CACHE_TIMEOUT',
            'AUTH_LDAP_ALWAYS_UPDATE_USER'
          ]
        ]
      ],
      fieldsMeta: {
        AUTH_LDAP_BIND_DN: {
          rules: [rules.Required]
        },
        AUTH_LDAP_BIND_PASSWORD: {
          component: UpdateToken
        },
        AUTH_LDAP_SEARCH_OU: {
          rules: [rules.Required]
        },
        AUTH_LDAP_USER_ATTR_MAP: {
          component: JsonEditor,
          rules: [JsonRequired]
        },
        AUTH_LDAP_CACERT_CONTENT: {
          component: UploadKey,
          helpText: this.$t('AuthLdapCACertHelpText'),
          hidden: (formValue) => !isLdaps(formValue)
        },
        AUTH_LDAP_CERT_CONTENT: {
          component: UploadKey,
          helpText: this.$t('AuthLdapCertHelpText'),
          hidden: (formValue) => !isLdaps(formValue)
        },
        AUTH_LDAP_KEY_CONTENT: {
          component: UploadKey,
          helpText: this.$t('AuthLdapKeyHelpText'),
          hidden: (formValue) => !isLdaps(formValue)
        }
      },
      hasDetailInMsg: false,
      moreButtons: [
        {
          title: this.$t('LdapConnectTest'),
          loading: false,
          callback: function (value, form, btn) {
            if (value['AUTH_LDAP_BIND_PASSWORD'] === undefined) {
              value['AUTH_LDAP_BIND_PASSWORD'] = ''
            }
            ;[
              'AUTH_LDAP_CACERT_CONTENT',
              'AUTH_LDAP_CERT_CONTENT',
              'AUTH_LDAP_KEY_CONTENT'
            ].forEach((key) => {
              if (value[key] === undefined) {
                value[key] = ''
              }
            })
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
          title: this.$t('LdapLoginTest'),
          callback: function (value, form) {
            this.dialogTest = true
          }.bind(this)
        },
        {
          title: this.$t('LdapBulkImport'),
          callback: function (value, form) {
            this.dialogLdapUserImport = true
          }.bind(this)
        },
        {
          title: this.$t('SyncSetting'),
          callback: function (value, form) {
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
        ;['AUTH_LDAP_CACERT_CONTENT', 'AUTH_LDAP_CERT_CONTENT', 'AUTH_LDAP_KEY_CONTENT'].forEach(
          (key) => {
            if (data[key] === '') {
              delete data[key]
            }
          }
        )
        return data
      }
    }
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
.listTable :deep(.table-action-right-side) {
  padding-top: 0 !important;
}
</style>
