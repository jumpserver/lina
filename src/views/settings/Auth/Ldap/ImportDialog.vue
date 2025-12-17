<template>
  <div>
    <Dialog
      :destroy-on-close="true"
      :show-cancel="false"
      :title="$tc('ImportLdapUserTitle')"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <el-alert type="success" style="margin-bottom: 10px"> {{ $t('ImportLdapUserTip') }}</el-alert>
      <ListTable
        ref="listTable"
        :header-actions="headerActions"
        :table-config="tableConfig"
        class="listTable"
      />
      <div slot="footer">
        <span v-show="showOrgSelect" class="org-select">
          <span class="label">{{ $tc('ImportOrg') }}：</span>
          <Select2
            ref="select2"
            v-model="select2.value"
            popper-class="select-org-dropdown"
            v-bind="select2"
          />
        </span>
        <el-button :loading="dialogLdapUserSyncStatus" size="small" type="primary" @click="SyncUserClick">
          {{ $t('SyncUser') }}
        </el-button>
        <el-button :loading="dialogLdapUserImportLoginStatus" size="small" type="primary" @click="importUserClick">
          {{ $t('Import') }}
        </el-button>
        <el-button
          :loading="dialogLdapUserImportAllLoginStatus"
          size="small"
          type="primary"
          @click="importAllUserClick"
        >{{ $t('ImportAll') }}
        </el-button>
        <el-button size="small" @click="hiddenDialog">{{ $t('Cancel') }}</el-button>
      </div>
    </Dialog>
  </div>
</template>

<script lang="jsx">
import store from '@/store'
import { DEFAULT_ORG_ID, SYSTEM_ORG_ID } from '@/utils/jms/org'
import ListTable from '@/components/Table/ListTable'
import Dialog from '@/components/Dialog/index.vue'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import getStatusColumnMeta from '@/components/Table/ListTable/TableAction/const'

export default {
  name: 'ImportDialog',
  components: {
    ListTable,
    Dialog,
    Select2
  },
  props: {
    category: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      dialogLdapUserImportLoginStatus: false,
      dialogLdapUserImportAllLoginStatus: false,
      dialogLdapUserSyncStatus: false,
      refreshed: false,
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
        hasUpload: false,
        hasExport: false,
        hasImport: false,
        hasUpdate: false,
        handleRefreshClick: async ({ reloadTable }) => {
          reloadTable()
        }
      },
      tableConfig: {
        url: `/api/v1/settings/ldap/users/?category=${this.category}`,
        columns: ['status', 'username', 'name', 'email', 'groups', 'existing'],
        columnsMeta: {
          ...getStatusColumnMeta.bind(this)('status'),
          username: {
            label: this.$t('Username'),
            width: '180px'
          },
          name: {
            label: this.$t('Name'),
            width: '180px'
          },
          groups: {
            label: this.$t('UserGroups'),
            formatter: function(row) {
              return <span> {row.groups.join(' | ')} </span>
            }
          },
          email: {
            label: this.$t('Email')
          },
          existing: {
            label: this.$t('Existing'),
            width: '120px'
          },
          actions: {
            has: false
          }
        }
      },
      select2: {
        multiple: true,
        ajax: {
          url: '/api/v1/orgs/orgs/',
          transformOption: (item) => {
            if (item.id !== SYSTEM_ORG_ID) {
              return { label: item.name, value: item.id }
            }
          }
        },
        value: this.orgIds()
      }
    }
  },
  computed: {
    showOrgSelect() {
      return store.getters.hasValidLicense
    }
  },
  methods: {
    orgIds() {
      return [DEFAULT_ORG_ID]
    },
    importUserClick() {
      this.dialogLdapUserImportLoginStatus = true
      const selectIds = []
      this.$refs.listTable.selectedRows.forEach((item, index) => {
        selectIds.push(item.id)
      })
      const org_ids = this.select2.value || []
      const data = {
        org_ids: org_ids,
        username_list: selectIds
      }
      if (selectIds.length === 0) {
        this.$message.error(this.$tc('UnselectedUser'))
        this.dialogLdapUserImportLoginStatus = false
      } else if (org_ids.length === 0) {
        this.$message.error(this.$tc('UnselectedOrg'))
        this.dialogLdapUserImportLoginStatus = false
      } else {
        this.importLdapUser(data)
      }
    },
    importAllUserClick() {
      this.dialogLdapUserImportAllLoginStatus = true
      const org_ids = this.select2.value || []
      const data = {
        org_ids: org_ids,
        username_list: ['*']
      }
      if (org_ids.length === 0) {
        this.$message.error(this.$tc('UnselectedOrg'))
        this.dialogLdapUserImportLoginStatus = false
      } else {
        this.importLdapUser(data)
      }
    },
    importLdapUser(data) {
      this.enableWS()
      this.ws.onopen = (e) => {
        this.ws.send(JSON.stringify({ msg_type: 'import_user', ...data }))
      }
      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.ok) {
          this.$message.success(data.msg)
          this.$refs.listTable.reloadTable()
        } else {
          this.$message.error(data.msg) || this.$t('ImportFail')
        }
        this.dialogLdapUserImportLoginStatus = false
        this.dialogLdapUserImportAllLoginStatus = false
      }
    },
    enableWS() {
      const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws'
      const port = document.location.port ? ':' + document.location.port : ''
      const url = `/ws/ldap/?category=${this.category}`
      const wsURL = scheme + '://' + document.location.hostname + port + url
      this.ws = new WebSocket(wsURL)
    },
    SyncUserClick() {
      this.dialogLdapUserSyncStatus = true
      this.enableWS()
      this.ws.onopen = (e) => {
        this.ws.send(JSON.stringify({ msg_type: 'sync_user' }))
      }
      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.ok) {
          this.$refs.listTable.reloadTable()
        } else {
          this.$message.error(data.msg)
        }
        this.dialogLdapUserSyncStatus = false
      }
    },
    handlerListTableXHRError(errMsg) {
      if (this.dialogLdapUserImport) {
        setTimeout(this.$refs.listTable.reloadTable, 30000)
      }
    },
    hiddenDialog() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-select-dropdown.select-org-dropdown {
  max-width: 300px !important;
}

.org-select {
  float: left;
  width: 300px;
  display: inline-block;
  text-align: left;
  padding-left: 14px;

  .label {
    font-weight: bold;
    width: 100px !important;
  }

  .select2 {
    width: 180px !important;
  }
}
</style>
