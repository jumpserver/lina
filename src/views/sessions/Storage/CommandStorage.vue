<template>
  <ListTable :table-config="commandTableConfig" :header-actions="commandActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
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
        hasMoreActions: false,
        moreCreates: {
          callback: (item) => {
            this.$router.push({ name: 'CreateCommandStorage', query: { type: item.name }})
          },
          dropdown: [
            {
              name: 'es',
              title: 'Elasticsearch'
            }
          ]
        }
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
            formatterArgs: {
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
                    TestCommandStorage(row.id).then(data => {
                      if (!data.is_valid) {
                        this.$message.error(data.msg)
                      } else {
                        this.$message.success(data.msg)
                      }
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
