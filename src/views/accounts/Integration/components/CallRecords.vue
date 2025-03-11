<template>
  <GenericListTable ref="listTable" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index.vue'

export default {
  name: 'CallRecords',
  components: {
    GenericListTable
  },
  props: {
    object: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data() {
    return {
      tableConfig: {
        url: this.getUrl(),
        columns: [
          'service', 'service_id', 'asset', 'account', 'remote_addr', 'datetime'
        ],
        columnsShow: {
          min: [
            'service', 'account', 'datetime'
          ],
          default: [
            'service', 'asset', 'account', 'remote_addr', 'datetime'
          ]
        },
        extraQuery: {
          order: '-datetime'
        },
        columnsMeta: {
          service: {
            label: this.$t('RelevantApp')
          },
          remote_addr: {
            width: '180px'
          },
          actions: {
            has: false
          }
        }
      },
      headerActions: {
        hasSearch: true,
        hasRefresh: true,
        hasRightActions: true,
        hasLeftActions: false,
        hasMoreActions: false,
        hasExport: false,
        hasImport: false
      }
    }
  },
  methods: {
    getUrl() {
      const baseUrl = '/api/v1/audits/service-access-logs/'
      return this.object.id ? `${baseUrl}?service_id=${this.object.id}` : baseUrl
    }
  }
}
</script>
