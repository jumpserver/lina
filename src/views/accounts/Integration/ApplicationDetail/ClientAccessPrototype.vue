<template>
  <div v-loading="loading" class="credential-applications">
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
    <p class="context-help">{{ $t('CredentialApplicationsAccessHelp') }}</p>
    <el-alert v-if="failed" :title="$t('SelectLoadFailed')" type="error" :closable="false" />
    <el-table :data="applications">
      <el-table-column :label="$t('Application')" min-width="180">
        <template #default="{ row }">
          <el-link underline="never" @click="openApplication(row)">{{ row.name }}</el-link>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Active')" width="100">
        <template #default="{ row }">{{ $t(row.is_active ? 'Yes' : 'No') }}</template>
      </el-table-column>
      <el-table-column :label="$t('ConnectionInstances')" min-width="150">
        <template #default="{ row }">
          <el-link
            v-if="$hasPerm('accounts.view_credentialclientinstance')"
            underline="never"
            @click="showInstances(row)"
          >
            {{ row.online_instances_amount }} / {{ row.instances_amount }}
          </el-link>
          <span v-else>{{ row.online_instances_amount }} / {{ row.instances_amount }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('LastReportedAt')" width="180">
        <template #default="{ row }">{{
          row.last_reported ? localDate(row.last_reported) : '-'
        }}</template>
      </el-table-column>
      <el-table-column :label="$t('Actions')" width="140">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            :disabled="
              !row.is_active ||
              !$hasPerm('accounts.change_integrationapplication') ||
              !$hasPerm('accounts.view_credentialclientinstance')
            "
            @click="openApplication(row, true)"
          >
            {{ $t('AccessWizard') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Drawer v-model:visible="instancesVisible" :title="selectedApplication?.name || ''">
      <ApplicationConnections
        v-if="instancesVisible && selectedApplication"
        :object="selectedApplication"
        :credential-id="object.id"
        :show-wizard="false"
      />
    </Drawer>
  </div>
</template>

<script>
import Drawer from '@/components/Drawer'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { getCredentialAccessApplications } from '@/api/applicationCredential'
import ApplicationConnections from './ApplicationConnections.vue'

export default {
  name: 'CredentialAccessApplications',
  components: { Drawer, ApplicationConnections },
  props: { object: { type: Object, required: true } },
  data() {
    return {
      loading: false,
      failed: false,
      applications: [],
      summary: { applications_amount: 0, instances_amount: 0, online_instances_amount: 0 },
      instancesVisible: false,
      selectedApplication: null
    }
  },
  watch: {
    'object.id': { immediate: true, handler: 'loadApplications' }
  },
  methods: {
    localDate: toSafeLocalDateStr,
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
      } catch {
        this.failed = true
      } finally {
        this.loading = false
      }
    },
    showInstances(application) {
      this.selectedApplication = application
      this.instancesVisible = true
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
  padding: 16px 0;
}
.access-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.access-summary .el-button {
  margin-left: auto;
}
.context-help {
  color: var(--el-text-color-secondary);
  margin-bottom: 16px;
}
</style>
