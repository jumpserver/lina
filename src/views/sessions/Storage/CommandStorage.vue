<template>
  <ListTable :table-config="commandTableConfig" :header-actions="commandActions" />
</template>

<script>
import { ListTable } from '@/components'
import { TestCommandStorage } from '@/api/sessions'
export default {
  name: 'CommandStorage',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      commandActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasCreate: false,
        extraMoreActions: [
          {
            name: 'Elasticsearch',
            title: 'Elasticsearch',
            type: 'primary',
            callback: this.createEs.bind(this)
          }
        ],
        moreActionsTitle: '创建'
      },
      commandTableConfig: {
        title: 'command',
        url: '/api/v1/terminal/command-storages/',
        columns: ['name', 'type', 'comment', 'actions'],
        columnsMeta: {
          comment: {
            sortable: 'custom'
          },
          name: {
            formatter: function(row) {
              return row.name
            }
          },
          type: {
            formatter: function(row) {
              return row.type
            }
          },
          actions: {
            prop: 'id',
            actions: {
              canUpdate: function(row, cellValue) {
                return (row.name !== 'default' && row.name !== 'null')
              },
              onUpdate: function({ row, col }) {
                this.$router.push({ name: 'CommandStorageUpdate', params: { id: row.id }})
              },
              canDelete: function(row, cellValue) {
                return (row.name !== 'default' && row.name !== 'null')
              },
              extraActions: [
                {
                  name: 'test',
                  title: this.$t('sessions.test'),
                  type: 'primary',
                  callback: function({ row, col, cellValue, reload }) {
                    TestCommandStorage(cellValue).then(data => {
                      let success = 'success'
                      if (!data.is_valid) {
                        success = 'error'
                      }
                      this.$notify({
                        message: data.msg,
                        type: success,
                        duration: 4500
                      })
                    })
                  }
                }
              ]
            }
          }
        }
      }
    }
  },
  methods: {
    createEs() {
      this.$router.push({ name: 'CreateCommandStorage', query: { type: 'es' }})
    }
  }
}

</script>

<style scoped>

</style>
