<template>
  <div>
    <Dialog
      :title="$t('setting.importLdapUserTitle')"
      v-bind="$attrs"
      :destroy-on-close="true"
      :show-cancel="false"
      v-on="$listeners"
    >
      <el-alert type="success"> {{ $t('setting.importLdapUserTip') }}</el-alert>
      <ListTable
        ref="listTable"
        class="listTable"
        :table-config="tableConfig"
        :header-actions="headerActions"
        @error="handlerListTableXHRError($event)"
      />
      <div slot="footer">
        <el-button size="small" @click="hiddenDialog">{{ $t('common.Cancel') }}</el-button>
        <el-button type="primary" size="small" :loading="dialogLdapUserImportLoginStatus" @click="importUserClick">{{ $t('common.Import') }}</el-button>
        <el-button type="primary" size="small" :loading="dialogLdapUserImportAllLoginStatus" @click="importAllUserClick">{{ $t('common.ImportAll') }}</el-button>
      </div>
    </Dialog>
  </div>
</template>

<script>
import ListTable from '@/components/ListTable'
import Dialog from '@/components/Dialog'
import { importLdapUser, refreshLdapUserCache, startLdapUserCache } from '@/api/settings'
import { getErrorResponseMsg } from '@/utils/common'

export default {
  name: 'ImportDialog',
  components: {
    ListTable,
    Dialog
  },
  data() {
    return {
      dialogLdapUserImportLoginStatus: false,
      dialogLdapUserImportAllLoginStatus: false,
      refreshed: false,
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
        hasUpload: false,
        hasExport: false,
        hasImport: false,
        hasUpdate: false,
        handleRefreshClick: async({ reloadTable }) => {
          if (!this.refreshed) {
            await refreshLdapUserCache()
            await startLdapUserCache()
            this.refreshed = true
          }
          reloadTable()
        }
      },
      tableConfig: {
        url: '/api/v1/settings/ldap/users/',
        columns: ['username', 'name', 'email', 'groups', 'existing'],
        columnsMeta: {
          username: {
            label: this.$t('users.Username'),
            width: '180px'
          },
          name: {
            label: this.$t('users.Name'),
            width: '180px'
          },
          groups: {
            label: this.$t('users.UserGroups'),
            showOverflowTooltip: true,
            formatter: function(row) {
              return <span> {row.groups.join(' | ')} </span>
            }
          },
          email: {
            label: this.$t('users.Email')
          },
          existing: {
            label: this.$t('users.Existing'),
            width: '120px'
          }
        }
      }
    }
  },
  methods: {
    importUserClick() {
      this.dialogLdapUserImportLoginStatus = true
      const selectIds = []
      this.$refs.listTable.selectedRows.forEach((item, index) => {
        selectIds.push(item.id)
      })
      const data = {
        username_list: selectIds
      }
      if (selectIds.length === 0) {
        this.$message.error(this.$t('setting.unselectedUser'))
        this.dialogLdapUserImportLoginStatus = false
      } else {
        importLdapUser(data).then(res => {
          this.$message.success(res.msg)
          // eslint-disable-next-line no-return-assign
        }).catch(error => {
          const errorMessage = getErrorResponseMsg(error) || this.$t('common.imExport.ImportFail')
          this.$message.error(errorMessage)
        }).finally(() => {
          this.dialogLdapUserImportLoginStatus = false
        })
      }
    },
    importAllUserClick() {
      this.dialogLdapUserImportAllLoginStatus = true
      const data = {
        username_list: ['*']
      }
      importLdapUser(data).then(res => {
        this.$message.success(res.msg)
        // eslint-disable-next-line no-return-assign
      }).finally(() => this.dialogLdapUserImportAllLoginStatus = false)
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

<style scoped>

</style>
