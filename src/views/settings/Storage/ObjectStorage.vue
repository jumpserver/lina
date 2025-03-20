<template>
  <ListTable
    ref="ListTable"
    :create-drawer="createDrawer"
    :header-actions="replayActions"
    :table-config="replayTableConfig"
  />
</template>
<script>
import { DrawerListTable as ListTable } from '@/components'
import { SetToDefaultReplayStorage, TestReplayStorage } from '@/api/sessions'
import { STORAGE_TYPE_META_MAP } from '@/views/sessions/const'

export default {
  name: 'ReplayStorage',
  components: {
    ListTable
  },
  data() {
    const vm = this
    const storageOptions = this.getReplayStorageOptions()
    return {
      createDrawer: () => import('./ObjectStorageCreateUpdate.vue'),
      replayActions: {
        canCreate: this.$hasPerm('terminal.add_replaystorage'),
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
        hasMoreActions: false,
        moreCreates: {
          callback: (item) => {
            this.$route.query['type'] = item.name
            this.$refs.ListTable.onCreate()
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
        columnsExclude: ['meta'],
        columns: [
          'id', 'name', 'type', 'is_default', 'comment', 'actions'
        ],
        columnsShow: {
          default: ['name', 'type', 'comment', 'is_default', 'actions'],
          min: ['name', 'type', 'actions']
        },
        columnsMeta: {
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
          comment: {
            sortable: 'custom'
          },
          actions: {
            formatterArgs: {
              canUpdate: function({ row }) {
                return (
                  row.name !== 'default' && row.name !== 'null' && vm.$hasPerm('terminal.change_replaystorage')
                )
              },
              canDelete: function({ row }) {
                return (row.name !== 'default' && row.name !== 'null' && vm.$hasPerm('terminal.delete_replaystorage'))
              },
              onUpdate: ({ row }) => {
                this.$refs.ListTable.onUpdate({ row, query: { type: row.type.value }})
              },
              hasClone: false,
              extraActions: [
                {
                  name: 'test',
                  title: this.$t('Test'),
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
                  title: this.$t('SetToDefault'),
                  can: (value) => this.$hasPerm('terminal.change_replaystorage') && value.row.type.value !== 'sftp',
                  type: 'primary',
                  callback: function({ row, col, cellValue, reload }) {
                    SetToDefaultReplayStorage(row.id).then(data => {
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
    getReplayStorageOptions() {
      const options = []
      const storages = Object.values(STORAGE_TYPE_META_MAP)
      for (const s of storages) {
        if (s.name === 'sftp' && !this.$hasLicense()) continue
        const option = {
          name: s.name,
          title: s.title
        }
        options.push(option)
      }
      return options
    }
  }
}
</script>

<style scoped>

</style>
