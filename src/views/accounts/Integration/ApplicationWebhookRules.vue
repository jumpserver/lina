<template>
  <div>
    <ListTable ref="table" :header-actions="headerActions" :table-config="tableConfig" />
    <Drawer v-model:visible="drawerVisible" :has-footer="false" :title="drawerTitle">
      <WebhookNotification :rule="selected" @cancel="drawerVisible = false" @saved="saved" />
    </Drawer>
  </div>
</template>

<script lang="jsx">
import { ListTable } from '@/components'
import Drawer from '@/components/Drawer'
import { ActionsFormatter, StatusFormatter } from '@/components/Table/TableFormatters'
import request from '@/utils/request'
import WebhookNotification from './ApplicationDetail/WebhookNotification.vue'

const url = '/api/v1/accounts/application-webhooks/'

export default {
  name: 'ApplicationWebhookRules',
  components: { Drawer, ListTable, WebhookNotification },
  data() {
    return {
      drawerVisible: false,
      selected: {},
      tableConfig: {
        url,
        hasSelection: false,
        columns: [
          { prop: 'name', label: this.$t('Name'), minWidth: 180 },
          {
            prop: 'applications',
            label: this.$t('Applications'),
            minWidth: 200,
            formatter: (row) => row.applications?.map((item) => item.name).join(', ') || '-'
          },
          { prop: 'url_display', label: this.$t('WebhookURL'), minWidth: 220 },
          {
            prop: 'events',
            label: this.$t('WebhookSubscribedEvents'),
            minWidth: 180,
            formatter: (row) => this.$t('EventsCount', { count: row.events?.length || 0 })
          },
          {
            prop: 'is_active',
            label: this.$t('EnableStatus'),
            width: 100,
            formatter: StatusFormatter
          },
          {
            prop: 'actions',
            label: this.$t('Actions'),
            width: 130,
            formatter: ActionsFormatter,
            formatterArgs: {
              hasClone: false,
              canUpdate: () => this.$hasPerm('accounts.change_applicationwebhook'),
              canDelete: () => this.$hasPerm('accounts.delete_applicationwebhook'),
              onUpdate: ({ row }) => this.open(row),
              onDelete: ({ row }) => this.remove(row)
            }
          }
        ]
      }
    }
  },
  computed: {
    headerActions() {
      return {
        hasCreate: this.$hasPerm('accounts.add_applicationwebhook'),
        onCreate: () => this.open({}),
        hasBulkDelete: false,
        hasImport: false,
        hasExport: false,
        searchConfig: { getUrlQuery: false }
      }
    },
    drawerTitle() {
      return this.selected.id
        ? this.$t('EditEventNotificationRule')
        : this.$t('NewEventNotificationRule')
    }
  },
  methods: {
    open(rule) {
      this.selected = rule
      this.drawerVisible = true
    },
    async saved() {
      this.drawerVisible = false
      await this.$refs.table.reloadTable()
    },
    async remove(rule) {
      await this.$confirm(
        this.$t('DeleteEventNotificationRuleConfirm', { name: rule.name }),
        this.$t('Warning'),
        { type: 'warning' }
      )
      await request.delete(`${url}${rule.id}/`)
      await this.$refs.table.reloadTable()
      this.$message.success(this.$t('DeleteSuccessMsg'))
    }
  }
}
</script>
