<template>
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
      <el-button @click="hiddenDialog">{{ $t('common.Cancel') }}</el-button>
      <el-button type="primary" :loading="dialogLdapUserImportLoginStatus" @click="importUserClick">{{ $t('common.Import') }}</el-button>
    </div>
  </Dialog>
</template>

<script>
import ListTable from '@/components/ListTable'
import Dialog from '@/components/Dialog'
import { importLdapUser, refreshLdapUserCache, StartLdapUserCache } from '@/api/settings'

export default {
  name: 'ImportDialog',
  components: {
    ListTable,
    Dialog
  },
  data() {
    return {
      dialogLdapUserImportLoginStatus: false,
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
        hasUpload: false,
        hasExport: false,
        hasImport: false,
        hasUpdate: false,
        hasRefresh: true,
        extraActions: [
          {
            name: 'refresh',
            title: this.$t('setting.refreshLdapUser'),
            type: 'primary',
            has: true,
            can: true,
            callback: function() {
              refreshLdapUserCache().then(res => {
                this.$message.success(this.$t('setting.refreshLdapCache'))
                StartLdapUserCache()
              })
            }.bind(this)
          }
        ]
      },
      tableConfig: {
        url: '/api/v1/settings/ldap/users/',
        columns: ['username', 'name', 'email', 'existing'],
        columnsMeta: {
          username: {
            label: this.$t('users.Username'),
            width: '180px'
          },
          name: {
            label: this.$t('users.Name'),
            width: '180px'
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
        }).finally(() => this.dialogLdapUserImportLoginStatus = false)
      }
    },
    handlerListTableXHRError(errMsg) {
      if (this.dialogLdapUserImport) {
        setTimeout(this.$refs.listTable.reloadTable, 30000)
      }
    },
    hiddenDialog() {
      this.$emit('update:show', false)
    }
  }
}
</script>

<style scoped>

</style>
