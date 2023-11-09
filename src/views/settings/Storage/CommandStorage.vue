<template>
  <div>
    <ListTable ref="ListTable" :header-actions="commandActions" :table-config="commandTableConfig" />
  </div>
</template>

<script>
import ListTable from '@/components/Table/ListTable/index.vue'
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
            align: 'center',
            width: '100px'
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
                      this.$message.success(this.$tc('sessions.SetSuccess'))
                    }).catch(() => {
                      this.$message.error(this.$tc('sessions.SetFailed'))
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
