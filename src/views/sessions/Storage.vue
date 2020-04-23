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
        extraActions: [
          {
            name: 'createReplay',
            title: this.$t('sessions.createReplay'),
            type: 'primary',
            callback: function() {
              console.log('createReplay===')
            }
          }
        ]
      },
      replayTableConfig: {
        url: '/api/v1/terminal/replay-storages/',
        columns: ['name', 'type', 'comment', 'actions'],
        columnsMeta: {
          type: {
            formatter: function(row) {
              return row.type
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
        extraActions: [
          {
            name: 'createCommand',
            title: this.$t('sessions.createCommand'),
            type: 'primary',
            callback: function() {
              console.log('createCommand====')
            }
          }
        ]

      },
      commandTableConfig: {
        title: 'command',
        url: '/api/v1/terminal/command-storages/',
        columns: ['name', 'type', 'comment', 'actions'],
        columnsMeta: {
          type: {
            formatter: function(row) {
              return row.type
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
