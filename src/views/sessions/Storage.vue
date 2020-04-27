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
            callback: this.createS3.bind(this)
          },
          {
            name: 'Ceph',
            title: 'Ceph',
            type: 'primary',
            callback: this.createCeph.bind(this)
          },
          {
            name: 'Swift',
            title: 'Swift',
            type: 'primary',
            callback: this.createSwift.bind(this)
          },
          {
            name: 'OSS',
            title: 'OSS',
            type: 'primary',
            callback: this.createOSS.bind(this)
          },
          {
            name: 'Azure',
            title: 'Azure',
            type: 'primary',
            callback: this.createAzure.bind(this)
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
              onUpdate: function({ row, col }) {
                this.$router.push({ name: 'ReplayStorageUpdate', params: { id: row.id }})
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
            callback: this.createEs.bind(this)
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
            actions: {
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
  },
  methods: {
    createS3() {
      this.$router.push({ name: 'CreateReplayStorage', query: { type: 's3' }})
    },
    createCeph() {
      this.$router.push({ name: 'CreateReplayStorage', query: { type: 'ceph' }})
    },
    createSwift() {
      this.$router.push({ name: 'CreateReplayStorage', query: { type: 'swift' }})
    },
    createOSS() {
      this.$router.push({ name: 'CreateReplayStorage', query: { type: 'oss' }})
    },
    createAzure() {
      this.$router.push({ name: 'CreateReplayStorage', query: { type: 'azure' }})
    },
    createEs() {
      this.$router.push({ name: 'CreateCommandStorage', query: { type: 'es' }})
    }
  }
}
</script>

<style scoped>

</style>
