<template>
  <div v-loading="loading" class="credential-applications">
    <el-alert
      :title="$t('CredentialApplicationsAccessHelp')"
      type="info"
      :closable="false"
      show-icon
    />
    <div class="access-summary">
      <strong>{{ $t('BoundApplicationsCount', { count: summary.applications_amount }) }}</strong>
      <span>{{
        $t('ConnectedInstancesSummary', {
          online: summary.online_instances_amount,
          total: summary.instances_amount
        })
      }}</span>
      <el-button @click="loadApplications">{{ $t('Refresh') }}</el-button>
    </div>
    <el-alert v-if="failed" :title="$t('SelectLoadFailed')" type="error" :closable="false" />
    <DataTable :config="tableConfig" />
  </div>
</template>

<script lang="jsx">
import { ElButton, ElLink } from 'element-plus'
import { markRaw } from 'vue'
import DataTable from '@/components/Table/DataTable'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { getCredentialAccessApplications } from '@/api/applicationCredential'
import ApplicationInstancesExpand from './ApplicationInstancesExpand.vue'

export default {
  name: 'CredentialAccessApplications',
  components: { DataTable },
  props: { object: { type: Object, required: true } },
  data() {
    return {
      loading: false,
      failed: false,
      applications: [],
      summary: { applications_amount: 0, instances_amount: 0, online_instances_amount: 0 },
      expandedApplicationIds: [],
      columns: [
        {
          prop: 'name',
          label: this.$t('Application'),
          minWidth: 180,
          formatter: (row) => (
            <ElLink underline="never" onClick={() => this.openApplication(row)}>
              {row.name}
            </ElLink>
          )
        },
        {
          prop: 'is_active',
          label: this.$t('Active'),
          width: 100,
          formatter: (row) => this.$t(row.is_active ? 'Yes' : 'No')
        },
        {
          prop: 'instances_amount',
          label: this.$t('ConnectionInstances'),
          minWidth: 150,
          formatter: (row) => {
            const count = `${row.online_instances_amount} / ${row.instances_amount}`
            return this.$hasPerm('accounts.view_credentialclientinstance') ? (
              <ElLink
                underline="never"
                aria-expanded={this.expandedApplicationIds.includes(row.id)}
                onClick={() => this.showInstances(row)}
              >
                {count}
              </ElLink>
            ) : (
              count
            )
          }
        },
        {
          prop: 'last_reported',
          label: this.$t('LastReportedAt'),
          width: 180,
          formatter: (row) => (row.last_reported ? toSafeLocalDateStr(row.last_reported) : '-')
        },
        {
          prop: 'actions',
          label: this.$t('Actions'),
          width: 140,
          formatter: (row) => (
            <ElButton
              plain
              size="small"
              type="primary"
              disabled={
                !row.is_active ||
                !this.$hasPerm('accounts.change_integrationapplication') ||
                !this.$hasPerm('accounts.view_credentialclientinstance')
              }
              onClick={() => this.openApplication(row, true)}
            >
              {this.$t('AccessWizard')}
            </ElButton>
          )
        }
      ]
    }
  },
  computed: {
    tableConfig() {
      return {
        totalData: this.applications,
        columns: [
          ...(this.$hasPerm('accounts.view_credentialclientinstance')
            ? [
                {
                  prop: 'instances',
                  type: 'expand',
                  width: 48,
                  formatter: markRaw(ApplicationInstancesExpand),
                  formatterArgs: { credentialId: this.object.id }
                }
              ]
            : []),
          ...this.columns
        ],
        hasSelection: false,
        hasPagination: false,
        hasOperation: false,
        hasEdit: false,
        hasDelete: false,
        tableAttrs: {
          border: true,
          rowKey: 'id',
          expandRowKeys: this.expandedApplicationIds,
          onExpandChange: this.handleExpandChange
        }
      }
    }
  },
  watch: {
    'object.id': { immediate: true, handler: 'loadApplications' }
  },
  methods: {
    async loadApplications() {
      const id = this.object.id
      if (!id) return
      this.loading = true
      this.failed = false
      try {
        const data = await getCredentialAccessApplications(id)
        if (this.object.id !== id) return
        this.applications = data.results
        this.summary = data
        this.expandedApplicationIds = this.expandedApplicationIds.filter((id) =>
          data.results.some((application) => application.id === id)
        )
      } catch {
        this.failed = true
      } finally {
        this.loading = false
      }
    },
    showInstances(application) {
      this.expandedApplicationIds = this.expandedApplicationIds.includes(application.id)
        ? []
        : [application.id]
    },
    handleExpandChange(application, expandedRows) {
      this.expandedApplicationIds = expandedRows.some((row) => row.id === application.id)
        ? [application.id]
        : []
    },
    openApplication(application, wizard = false) {
      this.$router.push({
        name: 'IntegrationApplicationDetail',
        params: { id: application.id },
        query: {
          access: '1',
          ...(wizard ? { wizard: '1' } : {})
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.credential-applications {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.access-summary {
  display: flex;
  align-items: center;
  gap: 8px 20px;
  flex-wrap: wrap;
}
.access-summary .el-button {
  margin-left: auto;
}
.credential-applications :deep(.el-table__expanded-cell) {
  padding: 0;
}
</style>
