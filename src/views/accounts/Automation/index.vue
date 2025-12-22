<template>
  <Page>
    <CardTable ref="CardTable" v-bind="$data" />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import CardTable from '@/components/Table/CardTable'

export default {
  name: 'Applets',
  components: {
    CardTable,
    Page
  },
  data() {
    return {
      pagination: false,
      tableConfig: {
        totalData: [
          {
            id: 'push-account',
            display_name: this.$t('AccountPushList'),
            name: 'AccountPushList',
            comment: this.$t('PushAccountsHelpText'),
            icon: 'push-account',
            tags: ['ansible']
          },
          {
            id: 'change_secret',
            display_name: this.$t('ChangeCredentials'),
            name: 'AccountChangeSecretList',
            comment: this.$t('ChangeCredentialsHelpText'),
            icon: 'change-password',
            edition: 'enterprise',
            tags: ['ansible']
          },
          {
            id: 'gather_account',
            display_name: this.$t('DiscoverAccounts'),
            name: 'AccountDiscoverList',
            comment: this.$t('DiscoverAccountsHelpText'),
            icon: 'gather-account',
            edition: 'enterprise',
            tags: ['ansible']
          },
          {
            id: 'backup_account',
            display_name: this.$t('AccountBackup'),
            name: 'AccountBackupList',
            comment: this.$t('BackupAccountsHelpText'),
            icon: 'backup-account',
            edition: 'enterprise',
            tags: ['email', 'SFTP']
          }
        ],
        onView: (item) => {
          this.$router.push({ name: item.name })
        }
      },
      headerActions: {
        hasSearch: false,
        hasLeftActions: false,
        hasRightActions: false
      }
    }
  },
  methods: {
    handleUpload(res) {
      this.$refs.CardTable.reloadTable()
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.image) {
  padding-right: 0;
}

:deep(.el-tag) {
  margin: 0 3px 0 0;
}
</style>
