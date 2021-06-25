<template>
  <ListTable ref="ListTable" :table-config="replayTableConfig" :header-actions="replayActions" />
</template>
<script>
import ListTable from '@/components/ListTable'
import { TestReplayStorage, SetToDefaultReplayStorage } from '@/api/sessions'
import { BooleanFormatter } from '@/components/TableFormatters'
export default {
  name: 'ReplayStorage',
  components: {
    ListTable
  },
  data() {
    const vm = this
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
          dropdown: [
            {
              name: 'S3',
              title: 'S3'
            },
            {
              name: 'Ceph',
              title: 'Ceph'
            },
            {
              name: 'swift',
              title: 'Swift'
            },
            {
              name: 'OSS',
              title: 'OSS'
            },
            {
              name: 'Azure',
              title: 'Azure'
            }
          ]
        }
      },
      replayTableConfig: {
        url: '/api/v1/terminal/replay-storages/',
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
            formatter: BooleanFormatter,
            formatterArgs: {
              iconChoices: {
                true: 'fa-check text-primary',
                false: ''
              }
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
                return (row.name !== 'default' && row.name !== 'null')
              },
              canDelete: function({ row }) {
                return (row.name !== 'default' && row.name !== 'null')
              },
              extraActions: [
                {
                  name: 'test',
                  title: this.$t('sessions.test'),
                  type: 'primary',
                  callback: function({ row, col, cellValue, reload }) {
                    TestReplayStorage(row.id).then(data => {
                      if (!data.is_valid) {
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
