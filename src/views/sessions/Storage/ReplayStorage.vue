<template>
  <ListTable :table-config="replayTableConfig" :header-actions="replayActions" />
</template>
<script>
import ListTable from '@/components/ListTable'
import { TestReplayStorage } from '@/api/sessions'
export default {
  name: 'ReplayStorage',
  components: {
    ListTable
  },
  data() {
    return {
      replayActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
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
              name: 'OBS',
              title: 'OBS'
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
        columns: ['name', 'type', 'comment', 'actions'],
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
          comment: {
            sortable: 'custom'
          },
          actions: {
            prop: 'id',
            formatterArgs: {
              onUpdate: function({ row, col }) {
                this.$router.push({ name: 'ReplayStorageUpdate', params: { id: row.id }, query: { type: row.type }})
              },
              canUpdate: function(row, cellValue) {
                return (row.name !== 'default' && row.name !== 'null')
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
                    TestReplayStorage(row.id).then(data => {
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
  }
}
</script>

<style scoped>

</style>
