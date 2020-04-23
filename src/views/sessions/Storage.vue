<template>
  <TabPage :submenu="submenu" :active-menu="activeSubMenu">
    <div slot="title">
      {{ Title }}
    </div>
    <div slot="replay">
      <ListTable :table-config="replayTableConfig" :header-actions="replayActions" />
    </div>
    <div slot="command">
      <ListTable :table-config="commandTableConfig" :header-actions="commandActions" />
    </div>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import { ListTable } from '@/components'
import { TestCommandStorage, TestReplayStorage } from '@/api/sessions'

export default {
  name: 'Storage',
  components: {
    TabPage,
    ListTable
  },
  data() {
    return {
      activeSubMenu: 'replay',
      submenu: [
        {
          title: this.$t('sessions.replayStorage'),
          name: 'replay'
        },
        {
          title: this.$t('sessions.commandStorage'),
          name: 'command'
        }
      ],
      replayActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasCreate: false,
        extraMoreActions: [
          {
            name: 'S3',
            title: 'S3',
            type: 'primary',
            callback: function() {
              console.log('S3===')
            }
          },
          {
            name: 'Ceph',
            title: 'Ceph',
            type: 'primary',
            callback: function() {
              console.log('Ceph===')
            }
          },
          {
            name: 'Swift',
            title: 'Swift',
            type: 'primary',
            callback: function() {
              console.log('Swift===')
            }
          },
          {
            name: 'OSS',
            title: 'OSS',
            type: 'primary',
            callback: function() {
              console.log('OSS===')
            }
          },
          {
            name: 'Azure',
            title: 'Azure',
            type: 'primary',
            callback: function() {
              console.log('Azure===')
            }
          }

        ]
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
            actions: {
              canUpdate: function(row, value) {
                return row.name !== 'null' && row.name !== 'default'
              },
              extraActions: [
                {
                  name: 'test',
                  title: 'test',
                  type: 'primary',
                  callback: function({ row, col, cellValue, reload }) {
                    TestReplayStorage(cellValue).then(data => {
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
      },
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
            callback: function() {
              console.log('Elasticsearch====')
            }
          }
        ]
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
              canUpdate: function(row, value) {
                return row.name !== 'null' && row.name !== 'default'
              },
              extraActions: [
                {
                  name: 'test',
                  title: 'test',
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
  computed: {
    Title() {
      return this.$t('sessions.storage')
    }
  }
}
</script>

<style scoped>

</style>
