<template>
  <div class="application-connections">
    <p class="context-help">{{ $t('ApplicationConnectionsHelp') }}</p>
    <ListTable ref="table" :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script lang="jsx">
import { ListTable } from '@/components'
import { toSafeLocalDateStr } from '@/composables/useDateTime'

export default {
  name: 'ApplicationConnections',
  components: { ListTable },
  props: {
    object: { type: Object, required: true }
  },
  data() {
    return {
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
        hasMoreActions: false,
        hasImport: false,
        hasExport: false,
        searchConfig: { getUrlQuery: false }
      },
      tableConfig: {
        url: '/api/v1/accounts/credential-client-instances/',
        extraQuery: { application: this.object.id },
        hasSelection: false,
        hasPagination: true,
        columnsMeta: { actions: { has: false } },
        columns: [
          { prop: 'instance_id', label: this.$t('InstanceID'), minWidth: 160 },
          {
            prop: 'configuration',
            label: this.$t('ClientAccessConfigurations'),
            minWidth: 170,
            formatter: (row) => row.configuration?.name || '-'
          },
          {
            prop: 'type',
            label: this.$t('ClientType'),
            width: 110,
            formatter: (row) => ((row.type?.value ?? row.type) === 'sdk' ? 'SDK' : 'Agent')
          },
          {
            prop: 'online',
            label: this.$t('ClientStatus'),
            width: 110,
            formatter: (row) =>
              this.$t(!row.is_active ? 'Disabled' : row.online ? 'Online' : 'Offline')
          },
          {
            prop: 'date_last_seen',
            label: this.$t('LastReportedAt'),
            width: 175,
            formatter: (row) => (row.date_last_seen ? toSafeLocalDateStr(row.date_last_seen) : '-')
          },
          {
            prop: 'credential_statuses',
            label: this.$t('ApplicationConnectionProgress'),
            minWidth: 240,
            formatter: (row) =>
              (row.credential_statuses || []).length
                ? row.credential_statuses
                    .map(
                      (status) =>
                        `${status.credential?.name}: ${status.fetched_revision} / ${
                          status.credential?.mode === 'subscription' ? '-' : status.applied_revision
                        }`
                    )
                    .join(', ')
                : '-'
          }
        ]
      }
    }
  },
  watch: {
    'object.id'(id) {
      this.tableConfig.extraQuery = { application: id }
      this.$nextTick(() => this.$refs.table?.reloadTable())
    }
  }
}
</script>

<style lang="scss" scoped>
.application-connections {
  padding: 16px 20px;
}

.context-help {
  color: var(--el-text-color-secondary);
  margin: 0 0 12px;
}
</style>
