<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        axiosConfig: {
          raw: 1,
          params: {
            display: 1,
            is_finished: 0
          }
        },
        url: '/api/v1/terminal/terminals/',
        columns: [
          {
            prop: 'name',
            label: this.$tc('Name'),
            key: 'name',
            formatter: DetailFormatter,
            sortable: true,
            route: 'TerminalDetail'
          },
          {
            prop: 'remote_addr',
            label: this.$t('sessions.addr'),
            sortable: 'custom'
          },
          {
            prop: 'session_online',
            label: this.$t('sessions.session'),
            sortable: true
          },
          {
            prop: 'is_active',
            label: this.$t('sessions.active')
          },
          {
            prop: 'is_alive',
            label: this.$t('sessions.alive'),
            sortable: 'custom'
          }
        ],
        tableActions: {
          editRoute: '404'
        }
      },
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
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
      console.log('handleStorageConfiguration')
    }
  }
}
</script>

<style>

</style>
