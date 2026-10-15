<template>
  <div class="application-connections">
    <div v-if="summary" class="access-summary">
      <strong>{{ object.name }}</strong>
      <span>{{
        $t('ConnectedInstancesSummary', {
          online: summary.online_instances_amount,
          total: summary.instances_amount
        })
      }}</span>
    </div>
    <p class="context-help">
      {{ $t(showWizard ? 'ApplicationAccessHelp' : 'ApplicationConnectionsHelp') }}
    </p>
    <ListTable
      ref="table"
      :header-actions="headerActions"
      :table-config="tableConfig"
      @loaded="loadSummary"
    />
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
    showWizard: { type: Boolean, default: true }
  },
  data() {
    return {
      wizardVisible: false,
      wizardBusy: false,
      summary: this.object.access_readiness || null,
      headerActions: {
        hasCreate: this.showWizard && this.canGenerate,
        canCreate: () => this.canGenerate,
        createTitle: this.$t('AccessWizard'),
        onCreate: () => this.openWizard(),
        hasBulkDelete: false,
        hasMoreActions: false,
        hasImport: false,
        hasExport: false,
        searchConfig: { getUrlQuery: false }
      },
      tableConfig: {
        url: '/api/v1/accounts/credential-client-instances/',
        extraQuery: this.instanceQuery,
        hasSelection: false,
        hasPagination: true,
        columnsMeta: { actions: { has: false } },
        columns: [
          { prop: 'instance_id', label: this.$t('InstanceID'), minWidth: 160 },
          {
            prop: 'type',
            label: this.$t('ClientType'),
            width: 100,
            formatter: (row) => (choiceValue(row.type) === 'sdk' ? 'SDK' : 'Agent')
          },
          {
            prop: 'credentials',
            label: this.$t('CredentialPolicies'),
            minWidth: 180,
            formatter: (row) => row.credentials?.map((item) => item.name).join(', ') || '-'
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
              row.credential_statuses
                ?.map(
                  (status) =>
                    `${status.credential?.name}: ${status.fetched_revision} / ${status.credential?.mode === 'subscription' ? '-' : status.applied_revision}`
                )
                .join(', ') || '-'
          },
          {
            prop: 'control',
            label: this.$t('Actions'),
            width: 100,
            formatter: (row) =>
              this.$hasPerm('accounts.change_credentialclientinstance') ? (
                <el-button link type="primary" onClick={() => this.toggleInstance(row)}>
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
  padding: 16px 0;
}
.access-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.context-help {
  color: var(--el-text-color-secondary);
  margin: 0 0 12px;
}
</style>
