<template>
  <ListTable ref="ListTable" :header-actions="commandActions" :table-config="commandTableConfig" />
</template>

<script>
import { DrawerListTable as ListTable } from '@/components'
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
        canCreate: this.$hasPerm('terminal.add_commandstorage'),
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
        columns: [
          'id', 'name', 'type', 'comment', 'is_default', 'actions'
        ],
        columnsExclude: ['meta'],
        columnsShow: {
          min: ['name', 'type', 'actions'],
          default: ['name', 'type', 'comment', 'is_default', 'actions']
        },
        columnsMeta: {
          comment: {
            sortable: 'custom'
          },
          name: {
            formatter: function(row) {
              return row.name
            }
          },
          is_default: {
            formatterArgs: {
              showFalse: false,
              showText: false
            },
            align: 'center'
          },
          actions: {
            formatterArgs: {
              canUpdate: function({ row }) {
                return (row.name !== 'default' && row.name !== 'null' && vm.$hasPerm('terminal.change_commandstorage'))
              },
              onUpdate: function({ row }) {
                this.$router.push({ name: 'CommandStorageUpdate', params: { id: row.id }, query: { type: row.type.value }})
              },
              canDelete: function({ row }) {
                return (row.name !== 'default' && row.name !== 'null' && vm.$hasPerm('terminal.delete_commandstorage'))
              },
              hasClone: false,
              extraActions: [
                {
                  name: 'test',
                  title: this.$t('Test'),
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
                  title: this.$t('SetToDefault'),
                  type: 'primary',
                  can: vm.$hasPerm('terminal.change_commandstorage'),
                  callback: function({ row, col, cellValue, reload }) {
                    SetToDefaultCommandStorage(row.id).then(data => {
                      vm.$refs.ListTable.reloadTable()
                      this.$message.success(this.$tc('SetSuccess'))
                    }).catch(() => {
                      this.$message.error(this.$tc('SetFailed'))
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
