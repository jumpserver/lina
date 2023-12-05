<template>
  <ListTable ref="ListTable" :header-actions="replayActions" :table-config="replayTableConfig" />
</template>
<script>
import ListTable from '@/components/Table/ListTable/index.vue'
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
      replayActions: {
        canCreate: this.$hasPerm('terminal.add_replaystorage'),
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
        columnsExclude: ['meta'],
        columns: [
          'name', 'type', 'comment', 'is_default', 'actions'
        ],
        columnsShow: {
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
            align: 'center',
            width: '100px'
          },
          comment: {
            sortable: 'custom'
          },
          actions: {
            formatterArgs: {
              onUpdate: function({ row }) {
                this.$router.push({ name: 'ReplayStorageUpdate', params: { id: row.id }, query: { type: row.type.value }})
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
                  can: (value) => this.$hasPerm('terminal.change_replaystorage') && value.row.type.value !== 'sftp',
                  type: 'primary',
                  callback: function({ row, col, cellValue, reload }) {
                    SetToDefaultReplayStorage(row.id).then(data => {
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
