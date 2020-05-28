<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { BooleanFormatter } from '@/components/ListTable/formatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/terminal/terminals/',
        columns: ['name', 'remote_addr', 'session_online', 'is_active', 'is_alive', 'actions'],
        columnsMeta: {
          name: {
            sortable: 'custom'
          },
          remote_addr: {
            sortable: 'custom'
          },
          is_active: {
            label: this.$t('sessions.active'),
            formatter: BooleanFormatter,
            width: '80px',
            align: 'center'
          },
          is_alive: {
            label: this.$t('sessions.alive')
          },
          session_online: {
            label: this.$t('sessions.session')
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
        hasUpload: false,
        hasExport: false,
        hasImport: false,
        hasUpdate: false,
        extraActions: [
          {
            name: 'StorageConfiguration',
            title: this.$t('sessions.StorageConfiguration'),
            type: 'primary',
            has: true,
            can: true,
            callback: this.handleStorageConfiguration
          }
        ]
      }
    }
  },
  methods: {
    handleStorageConfiguration() {
      this.$router.push('/terminal/storages')
    }
  }
}
</script>

<style>

</style>
