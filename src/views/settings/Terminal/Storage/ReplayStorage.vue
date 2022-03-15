<template>
  <ListTable ref="ListTable" :table-config="replayTableConfig" :header-actions="replayActions" />
</template>
<script>
import ListTable from '@/components/ListTable'
import { TestReplayStorage, SetToDefaultReplayStorage } from '@/api/sessions'
import { getReplayStorageOptions } from '@/views/sessions/const'
export default {
  name: 'ReplayStorage',
  components: {
    ListTable
  },
  data() {
    const vm = this
    const storageOptions = getReplayStorageOptions()
    return {
      replayActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
        hasMoreActions: false,
        moreCreates: {
          callback: (item) => {
            this.$router.push({ name: 'CreateReplayStorage', query: { type: item.name.toLowerCase() }})
          },
          dropdown: storageOptions
        }
      },
      replayTableConfig: {
        url: '/api/v1/terminal/replay-storages/',
        permissions: {
          app: 'terminal',
          resource: 'replaystorage'
        },
        columns: ['name', 'type', 'comment', 'is_default', 'actions'],
        columnsMeta: {
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
          comment: {
            sortable: 'custom'
          },
          actions: {
            prop: 'id',
            formatterArgs: {
              onUpdate: function({ row, col }) {
                this.$router.push({ name: 'ReplayStorageUpdate', params: { id: row.id }, query: { type: row.type }})
              },
              canUpdate: function({ row }) {
                return (
                  row.name !== 'default' && row.name !== 'null' && vm.$hasPerm('terminal.change_replaystorage')
                )
              },
              canDelete: function({ row }) {
                return (row.name !== 'default' && row.name !== 'null' && vm.$hasPerm('terminal.delete_replaystorage'))
              },
              hasClone: false,
              extraActions: [
                {
                  name: 'test',
                  title: this.$t('sessions.test'),
                  can: vm.$hasPerm('terminal.view_replaystorage'),
                  type: 'primary',
                  callback: function({ row, col, cellValue, reload }) {
                    TestReplayStorage(row.id).then(data => {
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
                  can: this.$hasPerm('terminal.change_replaystorage'),
                  type: 'primary',
                  callback: function({ row, col, cellValue, reload }) {
                    SetToDefaultReplayStorage(row.id).then(data => {
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
  }
}
</script>

<style scoped>

</style>
