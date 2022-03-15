<template>
  <ListTable ref="ListTable" :table-config="commandTableConfig" :header-actions="commandActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
import { SetToDefaultCommandStorage, TestCommandStorage } from '@/api/sessions'
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
    const vm = this
    return {
      commandActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
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
        permissions: {
          resource: 'commandstorage'
        },
        columns: ['name', 'type', 'comment', 'is_default', 'actions'],
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
          is_default: {
            formatterArgs: {
              showFalse: false
            },
            align: 'center',
            width: '100px'
          },
          actions: {
            prop: 'id',
            formatterArgs: {
              canUpdate: function({ row }) {
                return (row.name !== 'default' && row.name !== 'null' && vm.$hasPerm('terminal.change_commandstorage'))
              },
              onUpdate: function({ row }) {
                this.$router.push({ name: 'CommandStorageUpdate', params: { id: row.id }})
              },
              canDelete: function({ row }) {
                return (row.name !== 'default' && row.name !== 'null' && vm.$hasPerm('terminal.delete_commandstorage'))
              },
              hasClone: false,
              extraActions: [
                {
                  name: 'test',
                  title: this.$t('sessions.test'),
                  type: 'primary',
                  can: vm.$hasPerm('terminal.view_commandstorage'),
                  callback: function({ row, col, cellValue, reload }) {
                    TestCommandStorage(row.id).then(data => {
                      if (!data['is_valid']) {
                        this.$message.error(data.msg)
                      } else {
                        this.$message.success(data.msg)
                      }
                    })
                  }
                },
                {
                  name: 'set_to_default',
                  title: this.$t('sessions.SetToDefault'),
                  type: 'primary',
                  can: vm.$hasPerm('terminal.change_commandstorage'),
                  callback: function({ row, col, cellValue, reload }) {
                    SetToDefaultCommandStorage(row.id).then(data => {
                      vm.$refs.ListTable.reloadTable()
                      this.$message.success(this.$t('sessions.SetSuccess'))
                    }).catch(() => {
                      this.$message.error(this.$t('sessions.SetFailed'))
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
