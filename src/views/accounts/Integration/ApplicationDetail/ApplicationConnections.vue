<template>
  <div class="application-connections">
    <el-alert
      v-if="!embedded"
      :title="$t(showWizard ? 'ApplicationAccessHelp' : 'ApplicationConnectionsHelp')"
      type="info"
      :closable="false"
      show-icon
    />
    <ListTable
      ref="table"
      :header-actions="headerActions"
      :table-config="tableConfig"
      @loaded="!embedded && loadSummary()"
    >
      <template v-if="!embedded && summary" #search-before>
        <span class="access-summary">{{
          $t('ConnectedInstancesSummary', {
            online: summary.online_instances_amount,
            total: summary.instances_amount
          })
        }}</span>
      </template>
    </ListTable>
    <Drawer
      v-model:visible="wizardVisible"
      :title="$t('AccessWizard')"
      :show-close="!wizardBusy"
      :close-on-click-modal="!wizardBusy"
      :close-on-press-escape="!wizardBusy"
    >
      <ApplicationAccessWizard
        v-if="wizardVisible"
        :object="object"
        @busy="wizardBusy = $event"
        @close="closeWizard"
      />
    </Drawer>
  </div>
</template>

<script lang="jsx">
import { ListTable } from '@/components'
import Drawer from '@/components/Drawer'
import CopyableFormatter from '@/components/Table/TableFormatters/CopyableFormatter.vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import {
  choiceValue,
  getCredentialAccessApplications,
  setClientInstanceActive
} from '@/api/applicationCredential'
import ApplicationAccessWizard from './ApplicationAccessWizard.vue'

export default {
  name: 'ApplicationConnections',
  components: { ListTable, Drawer, ApplicationAccessWizard },
  props: {
    object: { type: Object, required: true },
    credentialId: { type: String, default: '' },
    showWizard: { type: Boolean, default: true },
    embedded: { type: Boolean, default: false }
  },
  data() {
    return {
      wizardVisible: false,
      wizardBusy: false,
      summary: this.object.access_readiness || null,
      headerActions: {
        has: !this.embedded,
        hasCreate: this.showWizard && this.canGenerate,
        canCreate: () => this.canGenerate,
        createTitle: this.$t('AccessWizard'),
        onCreate: () => this.openWizard(),
        hasBulkDelete: false,
        hasMoreActions: false,
        hasImport: false,
        hasExport: false,
        hasSearch: !this.embedded,
        searchConfig: { getUrlQuery: false }
      },
      tableConfig: {
        url: '/api/v1/accounts/credential-client-instances/',
        extraQuery: this.instanceQuery,
        hasSelection: false,
        hasPagination: true,
        columnsShow: { min: ['instance_id', 'remote_addr'] },
        columns: [
          { prop: 'instance_id', label: this.$t('InstanceID'), minWidth: 160 },
          {
            prop: 'remote_addr',
            label: this.$t('ClientAccessIP'),
            minWidth: 150,
            formatter: (row) =>
              row.remote_addr ? <CopyableFormatter cellValue={row.remote_addr} /> : '-'
          },
          {
            prop: 'type',
            label: this.$t('ClientType'),
            width: 120,
            formatter: (row) => (choiceValue(row.type) === 'sdk' ? 'SDK' : this.$t('PAMAgent'))
          },
          {
            prop: 'online',
            label: this.$t('ClientStatus'),
            width: 110,
            formatter: (row) => (
              <div>
                <div>
                  {this.$t(!row.is_active ? 'Disabled' : row.online ? 'Online' : 'Offline')}
                </div>
                {row.application_status?.status && (
                  <div class="usage-detail">
                    {this.applicationStatusLabel(row.application_status.status)}
                  </div>
                )}
              </div>
            )
          },
          {
            prop: 'date_last_seen',
            label: this.$t('LastReportedAt'),
            width: 175,
            formatter: (row) => (row.date_last_seen ? toSafeLocalDateStr(row.date_last_seen) : '-')
          },
          {
            prop: 'credential_statuses',
            label: this.$t('ApplicationAccountUsage'),
            minWidth: 240,
            formatter: (row) => this.formatAccountUsage(row)
          },
          {
            prop: 'actions',
            label: this.$t('Actions'),
            width: 100,
            formatter: (row) =>
              this.$hasPerm('accounts.change_credentialclientinstance') ? (
                <el-button
                  plain
                  size="small"
                  type={row.is_active ? 'danger' : 'primary'}
                  onClick={() => this.toggleInstance(row)}
                >
                  {this.$t(row.is_active ? 'Disable' : 'Enable')}
                </el-button>
              ) : (
                '-'
              )
          }
        ]
      }
    }
  },
  computed: {
    canGenerate() {
      return this.object.is_active && this.$hasPerm('accounts.change_integrationapplication')
    },
    instanceQuery() {
      return {
        application: this.object.id,
        ...(this.credentialId ? { credential: this.credentialId } : {})
      }
    }
  },
  watch: {
    instanceQuery: {
      immediate: true,
      handler(query) {
        this.tableConfig.extraQuery = query
        this.$nextTick(() => this.$refs.table?.reloadTable())
      }
    },
    canGenerate: {
      immediate: true,
      handler(value) {
        this.headerActions.hasCreate = this.showWizard && value
      }
    },
    'object.id': { immediate: true, handler: 'openRequestedWizard' },
    '$route.query.wizard': 'openRequestedWizard'
  },
  methods: {
    applicationStatusLabel(status) {
      const labels = {
        starting: 'ApplicationUsageStarting',
        running: 'Running',
        degraded: 'ApplicationUsageDegraded',
        stopping: 'ApplicationUsageStopping',
        stopped: 'ApplicationUsageStopped',
        error: 'Error'
      }
      return this.$t(labels[status] || 'Unknown')
    },
    formatAccountUsage(row) {
      const report =
        row.application_status?.status && Array.isArray(row.application_status.account_ids)
          ? row.application_status
          : null
      const accounts = new Map(
        (row.reported_accounts || []).map((account) => [account.id, account])
      )
      const used = (report?.account_ids || []).map((id) => {
        const account = accounts.get(id)
        if (!account) return id
        const name = account.username || account.name
        return account.asset?.name ? `${name} @ ${account.asset.name}` : name
      })
      const progress = row.credential_statuses
        ?.map(
          (status) =>
            `${status.credential?.name}: ${status.fetched_revision} / ${status.credential?.mode === 'subscription' ? '-' : status.applied_revision}`
        )
        .join(', ')
      return (
        <div class="account-usage-cell">
          <div class="usage-accounts" title={used.join(', ')}>
            {report
              ? used.join(', ') || this.$t('ApplicationNoAccountsInUse')
              : this.$t('ApplicationUsageNotReported')}
          </div>
          {row.date_status_reported && (
            <div class="usage-detail" title={toSafeLocalDateStr(row.date_status_reported)}>
              {this.$t(row.online ? 'ApplicationUsageReportedAt' : 'ApplicationUsageLastKnownAt', {
                date: toSafeLocalDateStr(row.date_status_reported)
              })}
            </div>
          )}
          {progress && (
            <div class="usage-detail" title={progress}>
              {this.$t('ApplicationConnectionProgress')}: {progress}
            </div>
          )}
        </div>
      )
    },
    openRequestedWizard() {
      if (
        this.showWizard &&
        this.object.id &&
        this.$route.query.wizard === '1' &&
        this.canGenerate
      ) {
        this.openWizard()
        const query = { ...this.$route.query }
        delete query.wizard
        this.$router.replace({ query })
      }
    },
    openWizard() {
      if (this.canGenerate) this.wizardVisible = true
    },
    closeWizard() {
      this.wizardVisible = false
      this.$refs.table?.reloadTable()
    },
    async loadSummary() {
      const id = this.object.id
      if (!id) return
      try {
        let summary
        if (this.credentialId) {
          const result = await getCredentialAccessApplications(this.credentialId)
          summary = result.results.find((item) => item.id === id)
        } else {
          const result = await this.$axios.get(`/api/v1/accounts/integration-applications/${id}/`, {
            disableFlashErrorMsg: true
          })
          summary = result.access_readiness
        }
        if (this.object.id === id) this.summary = summary
      } catch {
        this.summary = null
      }
    },
    async toggleInstance(row) {
      let reason = ''
      try {
        if (row.is_active) {
          const rotating = row.credential_statuses?.some(
            (item) => choiceValue(item.credential.status) !== 'idle'
          )
          if (rotating) {
            const result = await this.$prompt(
              this.$t('ExcludeRotatingClientReasonHelp'),
              this.$t('Disable'),
              {
                inputValidator: (value) => !!value?.trim(),
                inputErrorMessage: this.$t('ExclusionReasonRequired')
              }
            )
            reason = result.value.trim()
          } else {
            await this.$confirm(this.$t('DisableCredentialClientConfirm'), this.$t('Warning'), {
              type: 'warning'
            })
          }
        }
        await setClientInstanceActive(row.id, !row.is_active, reason)
        this.$refs.table?.reloadTable()
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$log.error(error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.application-connections {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
.access-summary {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  min-height: 30px;
  margin-right: 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  white-space: nowrap;
}
.application-connections :deep(.account-usage-cell) {
  min-width: 0;
}
.application-connections :deep(.usage-accounts),
.application-connections :deep(.usage-detail) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.application-connections :deep(.usage-detail) {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
