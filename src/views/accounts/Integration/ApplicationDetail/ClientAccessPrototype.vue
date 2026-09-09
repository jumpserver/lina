<template>
  <div class="client-access-page">
    <IBox v-if="accessReadiness" :title="$t('AccessReadiness')" class="readiness-card">
      <div class="readiness-summary">
        <div>
          <el-tag :type="readinessState.type">{{ $t(readinessState.title) }}</el-tag>
          <span class="readiness-description">{{ $t(readinessState.description) }}</span>
        </div>
        <el-button
          v-if="readinessState.action && readinessState.can"
          link
          type="primary"
          @click="handleReadinessAction"
        >
          {{ $t(readinessState.action) }}
        </el-button>
      </div>
      <div class="readiness-metrics">
        <span>
          {{ $t('AuthorizedAccountsCount', { count: accessReadiness.authorized_accounts_amount }) }}
        </span>
        <span>
          {{
            $t('AccessConfigurationsCount', {
              count: accessReadiness.active_configurations_amount
            })
          }}
        </span>
        <span>
          {{
            $t('OnlineClientInstancesCount', {
              online: accessReadiness.online_instances_amount,
              total: accessReadiness.active_instances_amount
            })
          }}
        </span>
        <span>{{ $t('LastFetchedAt', { value: formatDate(accessReadiness.last_fetched) }) }}</span>
      </div>
    </IBox>

    <ListTable
      v-if="viewMode === 'list'"
      ref="configurationTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />

    <Drawer
      v-model:visible="formVisible"
      :title="
        editingConfiguration
          ? $t('EditClientAccessConfiguration')
          : $t('NewClientAccessConfiguration')
      "
      :close-on-click-modal="!saving"
      :close-on-press-escape="!saving"
      :show-close="!saving"
    >
      <ClientAccessCreateUpdate
        v-if="formVisible"
        :application="object"
        :configuration="editingConfiguration"
        @saved="handleConfigurationSaved"
        @submitting="saving = $event"
      />
    </Drawer>

    <template v-if="viewMode === 'detail' && selectedConfiguration">
      <div v-if="selectedConfiguration" class="client-access-detail">
        <IBox :title="$t('ConnectionParameters')" class="detail-overview">
          <el-descriptions :column="2" :label-width="120" border class="connection-parameters">
            <el-descriptions-item
              v-for="item in [...connectionItems, ...identificationItems].filter(
                (field) => field.has !== false
              )"
              :key="item.key"
              :label="item.key"
              :span="item.span || 1"
              width="50%"
            >
              <ItemValue v-bind="item" />
            </el-descriptions-item>
          </el-descriptions>
        </IBox>

        <IBox :title="$t('ClientInstances')" class="detail-block">
          <ListTable
            ref="instancesTable"
            :header-actions="instanceHeaderActions"
            :table-config="instanceTableConfig"
          />
        </IBox>
      </div>
    </template>

    <Drawer
      v-model:visible="materialsVisible"
      :title="$t('GenerateConfiguration')"
      :close-on-click-modal="!generating"
      :close-on-press-escape="!generating"
      :show-close="!generating"
      @closed="clearMaterials"
    >
      <IBox v-if="materialsVisible" v-loading="generating" class="generated-material">
        <el-empty v-if="!generated" :description="$t('GenerateAccessMaterialHelp')">
          <el-button
            :disabled="!canGenerate || generating"
            type="primary"
            @click="generateMaterials"
          >
            {{ $t('GenerateConfiguration') }}
          </el-button>
        </el-empty>
        <template v-else>
          <template v-if="selectedConfiguration.type === 'sdk'">
            <div class="material-heading">
              <div>
                <h4>{{ $t('ConfigurationFile') }}</h4>
                <p>{{ configFileName }}</p>
              </div>
              <div>
                <el-button link type="primary" @click="copyText(configurationText)">
                  {{ $t('Copy') }}
                </el-button>
                <el-button link type="primary" @click="downloadConfiguration">
                  {{ $t('Download') }}
                </el-button>
              </div>
            </div>
            <pre><code>{{ configurationText }}</code></pre>
            <template v-if="selectedConfiguration.type === 'sdk'">
              <h4>{{ $t('InstallCommand') }}</h4>
              <pre><code>{{ installCommand }}</code></pre>
            </template>
          </template>

          <div class="material-heading material-heading--spaced">
            <div>
              <h4>
                {{
                  selectedConfiguration.type === 'sdk' ? $t('MinimalCode') : $t('InstallCommand')
                }}
              </h4>
              <p>
                {{
                  selectedConfiguration.type === 'sdk'
                    ? $t('MinimalCodeHelp')
                    : $t('InstallCommandHelp')
                }}
              </p>
            </div>
            <el-button link type="primary" @click="copyText(executionText)">
              {{ $t('Copy') }}
            </el-button>
          </div>
          <pre><code>{{ executionText }}</code></pre>
        </template>
      </IBox>
    </Drawer>
  </div>
</template>

<script lang="jsx">
import { IBox, ListTable } from '@/components'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import Drawer from '@/components/Drawer/index.vue'
import ItemValue from '@/components/Cards/DetailCard/ItemValue.vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { BASE_URL, copy } from '@/utils/common/index'
import { mapGetters } from 'vuex'
import ClientAccessCreateUpdate from './ClientAccessCreateUpdate.vue'
import {
  deleteClientAccessConfiguration,
  accessConfigurationUrl,
  requestAccessConfigurationTable,
  generateClientAccessMaterials,
  getClientAccessConfiguration,
  setClientInstanceActive
} from '@/api/applicationCredential'

export default {
  name: 'IntegrationApplicationClientAccess',
  components: {
    ClientAccessCreateUpdate,
    ItemValue,
    Drawer,
    IBox,
    ListTable
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  emits: ['detail-actions-change', 'edit-application'],
  data() {
    return {
      accessReadiness: null,
      configurationText: '',
      editingConfiguration: null,
      executionText: '',
      generated: false,
      generating: false,
      materialsVisible: false,
      formVisible: false,
      installCommand: '',
      saving: false,
      selectedConfiguration: null,
      viewMode: 'list',
      tableConfig: {
        url: accessConfigurationUrl,
        request: requestAccessConfigurationTable,
        extraQuery: { application: this.object.id },
        hasSelection: false,
        hasPagination: true,
        columns: [
          {
            prop: 'name',
            label: this.$t('Name'),
            minWidth: '190px',
            formatter: DetailFormatter,
            formatterArgs: {
              onClick: ({ row }) => this.openDetail(row)
            }
          },
          {
            prop: 'type',
            label: this.$t('ClientType'),
            width: '110px',
            formatter: (row) => (
              <el-tag effect="plain" type={row.type === 'sdk' ? 'primary' : 'success'}>
                {row.type === 'sdk' ? this.$t('SDKAccess') : this.$t('AgentAccess')}
              </el-tag>
            )
          },
          {
            prop: 'instances',
            label: `${this.$t('Online')}/${this.$t('Total')}`,
            width: '110px',
            formatter: (row) => (
              <div>
                <span class="text-primary">{row.online_instances_amount || 0}</span>
                /
                <span>{row.instances}</span>
              </div>
            )
          },
          {
            prop: 'last_reported',
            label: this.$t('LastReportedAt'),
            width: '175px',
            formatter: (row) => this.formatDate(row.last_reported)
          },
          {
            prop: 'actions',
            label: this.$t('Actions'),
            align: 'center',
            width: '130px',
            formatter: ActionsFormatter,
            formatterArgs: {
              hasClone: false,
              canUpdate: () => this.$hasPerm('accounts.change_clientaccessconfiguration'),
              canDelete: () => this.$hasPerm('accounts.delete_clientaccessconfiguration'),
              onUpdate: ({ row }) => this.openEdit(row),
              onDelete: ({ row }) => this.remove(row)
            }
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['currentOrg']),
    readinessState() {
      const readiness = this.accessReadiness
      if (!readiness.authorized_accounts_amount) {
        return {
          type: 'warning',
          title: 'AccessAccountsRequired',
          description: 'AccessAccountsRequiredHelp',
          action: 'ManageAuthorizedAccounts',
          can: this.$hasPerm('accounts.change_integrationapplication'),
          task: 'accounts'
        }
      }
      if (!readiness.active_configurations_amount) {
        return {
          type: 'warning',
          title: 'AccessConfigurationRequired',
          description: 'AccessConfigurationRequiredHelp',
          action: 'NewClientAccessConfiguration',
          can: this.$hasPerm('accounts.add_clientaccessconfiguration'),
          task: 'configuration'
        }
      }
      if (readiness.missing_authorized_accounts_amount) {
        return {
          type: 'danger',
          title: 'AccessAuthorizationIncomplete',
          description: 'AccessAuthorizationIncompleteHelp',
          action: 'ManageAuthorizedAccounts',
          can: this.$hasPerm('accounts.change_integrationapplication'),
          task: 'accounts'
        }
      }
      if (!readiness.active_instances_amount) {
        return {
          type: 'warning',
          title: 'AccessDeploymentPending',
          description: 'AccessDeploymentPendingHelp',
          action: 'ViewClientAccessConfiguration',
          can: true,
          task: 'configuration-detail'
        }
      }
      if (!readiness.online_instances_amount) {
        return {
          type: 'warning',
          title: 'AccessClientsOffline',
          description: 'AccessClientsOfflineHelp',
          action: 'ViewClientAccessConfiguration',
          can: true,
          task: 'configuration-detail'
        }
      }
      if (!readiness.last_fetched) {
        return {
          type: 'warning',
          title: 'AccessFirstFetchPending',
          description: 'AccessFirstFetchPendingHelp',
          action: 'ViewClientAccessConfiguration',
          can: true,
          task: 'configuration-detail'
        }
      }
      return {
        type: 'success',
        title: 'AccessReady',
        description: 'AccessReadyHelp',
        action: '',
        can: false,
        task: ''
      }
    },
    headerActions() {
      return {
        hasCreate: this.$hasPerm('accounts.add_clientaccessconfiguration'),
        canCreate: this.$hasPerm('accounts.add_clientaccessconfiguration'),
        onCreate: this.openCreate,
        hasBulkDelete: false,
        hasMoreActions: false,
        hasImport: false,
        hasExport: false,
        searchConfig: { getUrlQuery: false }
      }
    },
    instanceHeaderActions() {
      return {
        hasLeftActions: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasMoreActions: false,
        hasSearch: true,
        hasRightActions: true,
        hasColumnSetting: true,
        hasRefresh: true,
        hasImport: false,
        hasExport: false,
        searchConfig: {
          getUrlQuery: false,
          excludeFields: ['application', 'configuration', 'type', 'is_active']
        }
      }
    },
    canGenerate() {
      return (
        this.selectedConfiguration?.is_active &&
        this.$hasPerm('accounts.change_clientaccessconfiguration') &&
        this.$hasPerm('accounts.change_integrationapplication')
      )
    },
    detailPageActions() {
      if (this.viewMode !== 'detail' || !this.selectedConfiguration) return []
      const configuration = this.selectedConfiguration
      return [
        {
          name: 'back-to-access-list',
          title: this.$t('BackToClientAccessList'),
          icon: 'fa-arrow-left',
          plain: true,
          callback: this.backToList
        },
        {
          name: 'generate',
          title: this.$t('Generate'),
          tip: this.$t('GenerateConfiguration'),
          icon: 'fa-solid fa-file-code',
          has: this.canGenerate,
          loading: this.generating,
          callback: this.generateMaterials
        },
        {
          name: 'update',
          title: this.$t('Edit'),
          tip: this.$t('EditClientAccessConfiguration'),
          icon: 'el-icon-edit-outline',
          can: this.$hasPerm('accounts.change_clientaccessconfiguration'),
          callback: () => this.openEdit(configuration)
        },
        {
          name: 'delete',
          title: this.$t('Delete'),
          type: 'danger',
          plain: true,
          icon: 'el-icon-delete',
          can: this.$hasPerm('accounts.delete_clientaccessconfiguration'),
          callback: () => this.remove(configuration)
        }
      ]
    },
    instanceTableConfig() {
      return {
        url: '/api/v1/accounts/credential-client-instances/',
        extraQuery: { configuration: this.selectedConfiguration.id },
        hasSelection: false,
        hasPagination: true,
        columns: [
          { prop: 'instance_id', label: this.$t('InstanceID'), minWidth: 160 },
          {
            prop: 'online',
            label: this.$t('ClientStatus'),
            width: 110,
            formatter: (row) =>
              !row.is_active
                ? this.$t('Disabled')
                : row.online
                  ? this.$t('Online')
                  : this.$t('Offline')
          },
          {
            prop: 'date_last_seen',
            label: this.$t('LastReportedAt'),
            width: 175,
            formatter: (row) => this.formatDate(row.date_last_seen)
          },
          {
            prop: 'actions',
            label: this.$t('Actions'),
            width: 100,
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'toggle',
                  title: ({ row }) => this.$t(row.is_active ? 'Disable' : 'Enable'),
                  icon: ({ row }) => (row.is_active ? 'fa-solid fa-ban' : 'fa-circle-check'),
                  type: 'primary',
                  can: () => this.$hasPerm('accounts.change_credentialclientinstance'),
                  callback: ({ row }) => this.toggleInstance(row)
                }
              ]
            }
          }
        ]
      }
    },
    configFileName() {
      return 'jms-pam.json'
    },
    connectionItems() {
      const item = this.selectedConfiguration || {}
      return [
        { key: this.$t('Name'), value: item.name },
        {
          key: this.$t('ClientType'),
          value: item.type === 'sdk' ? this.$t('SDKAccess') : this.$t('AgentAccess')
        },
        {
          key: this.$t('ClientStatus'),
          value:
            item.status === 'disabled'
              ? this.$t('Disabled')
              : item.status === 'online'
                ? this.$t('Online')
                : this.$t('Offline')
        },
        { key: this.$t('LastReportedAt'), value: this.formatDate(item.last_reported) },
        {
          key: this.$t('AppEventNotification'),
          value: this.$t(item.notification_enabled ? 'Enabled' : 'Disabled'),
          span: 2
        },
        {
          key: this.$t('AppNotificationURL'),
          value: item.notification_url,
          has: Boolean(item.notification_enabled && item.type === 'agent'),
          span: 2
        },
        {
          key: this.$t('ApplicationCredentials'),
          value: (item.credentials || [])
            .map((credential) => `${credential.name} · ${credential.key}`)
            .join('\n'),
          span: 2
        }
      ]
    },
    identificationItems() {
      return [
        { key: this.$t('ClientAccessConfigurationID'), value: this.selectedConfiguration?.id },
        { key: this.$t('JumpServerAddress'), value: BASE_URL },
        { key: this.$t('ApplicationID'), value: this.object.id },
        { key: this.$t('OrganizationID'), value: this.currentOrg?.id || '-' }
      ]
    }
  },
  watch: {
    'object.access_readiness': {
      immediate: true,
      handler(value) {
        this.accessReadiness = value || null
      }
    },
    detailPageActions: {
      immediate: true,
      handler(actions) {
        this.$emit('detail-actions-change', actions)
      }
    },
    'object.id': {
      immediate: true,
      async handler(id) {
        if (!id) return
        this.viewMode = 'list'
        this.selectedConfiguration = null
        this.editingConfiguration = null
        this.formVisible = false
        this.materialsVisible = false
        this.clearMaterials()
        this.tableConfig.extraQuery = { application: id }
        await this.loadData()
        if (this.$route.query.configuration) {
          await this.openDetail({ id: this.$route.query.configuration })
        }
      }
    }
  },
  methods: {
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '-'
    },
    async loadData() {
      await this.$nextTick()
      return this.$refs.configurationTable?.reloadTable()
    },
    async backToList() {
      this.viewMode = 'list'
      this.selectedConfiguration = null
      this.clearMaterials()
      if (this.$route.query.configuration) {
        const query = { ...this.$route.query }
        delete query.configuration
        await this.$router.replace({ query })
      }
      await this.loadData()
    },
    async refreshAccessReadiness() {
      const application = await this.$axios.get(
        `/api/v1/accounts/integration-applications/${this.object.id}/`
      )
      this.accessReadiness = application.access_readiness
    },
    handleReadinessAction() {
      if (this.readinessState.task === 'accounts') {
        this.$emit('edit-application')
      } else if (this.readinessState.task === 'configuration') {
        this.openCreate()
      } else if (this.readinessState.task === 'configuration-detail') {
        this.openDetail(this.accessReadiness.configuration)
      }
    },
    openCreate() {
      this.editingConfiguration = null
      this.formVisible = true
    },
    async openEdit(row) {
      this.editingConfiguration = await getClientAccessConfiguration(row.id)
      this.formVisible = true
    },
    async openDetail(row) {
      const configuration = await getClientAccessConfiguration(row.id)
      if (configuration.application?.id !== this.object.id) {
        if (this.$route.query.configuration) {
          const query = { ...this.$route.query }
          delete query.configuration
          await this.$router.replace({ query })
        }
        return
      }
      this.selectedConfiguration = configuration
      this.clearMaterials()
      this.viewMode = 'detail'
    },
    async handleConfigurationSaved(saved, addContinue) {
      await Promise.all([this.loadData(), this.refreshAccessReadiness()])
      if (addContinue) return
      this.formVisible = false
      if (this.viewMode === 'detail') await this.openDetail(saved)
    },
    async remove(row) {
      await this.$confirm(
        this.$t('DeleteClientAccessConfirm', { name: row.name }),
        this.$t('Warning'),
        { type: 'warning' }
      )
      await deleteClientAccessConfiguration(row.id)
      if (this.selectedConfiguration?.id === row.id) {
        this.viewMode = 'list'
        this.selectedConfiguration = null
      }
      await Promise.all([this.loadData(), this.refreshAccessReadiness()])
      this.$message.success(this.$t('DeleteSuccessMsg'))
    },
    copyText(value) {
      copy(value)
    },
    clearMaterials() {
      this.generated = false
      this.configurationText = ''
      this.executionText = ''
      this.installCommand = ''
    },
    async generateMaterials() {
      if (!this.canGenerate || this.generating) return
      try {
        await this.$confirm(this.$t('GenerateSensitiveMaterialConfirm'), this.$t('Warning'), {
          type: 'warning'
        })
      } catch {
        return
      }
      this.generating = true
      this.clearMaterials()
      this.materialsVisible = true
      try {
        const materials = await generateClientAccessMaterials(this.selectedConfiguration.id)
        this.configurationText = materials.config ? JSON.stringify(materials.config, null, 2) : ''
        this.installCommand = materials.install_command
        this.executionText = materials.type === 'sdk' ? materials.code : materials.install_command
        this.generated = true
        this.$message.success(this.$t('ConfigurationGenerated'))
      } finally {
        this.generating = false
      }
    },
    async toggleInstance(row) {
      if (row.is_active) {
        await this.$confirm(this.$t('DisableCredentialClientConfirm'), this.$t('Warning'), {
          type: 'warning'
        })
      }
      await setClientInstanceActive(row.id, !row.is_active)
      this.$refs.instancesTable.reloadTable()
      await this.refreshAccessReadiness()
    },
    downloadConfiguration() {
      const blob = new Blob([this.configurationText], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = this.configFileName
      link.click()
      URL.revokeObjectURL(url)
    }
  }
}
</script>

<style lang="scss" scoped>
.readiness-card {
  margin-bottom: 15px;
}

.readiness-summary,
.readiness-summary > div,
.readiness-metrics {
  display: flex;
  align-items: center;
}

.readiness-summary {
  justify-content: space-between;
  gap: 20px;
}

.readiness-summary > div {
  min-width: 0;
  gap: 10px;
}

.readiness-description {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.readiness-metrics {
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-top: 14px;
  color: var(--color-help-text);
  font-size: 12px;
}

.material-heading p {
  margin: 4px 0 0;
  color: var(--color-help-text);
  font-size: 12px;
  line-height: 1.5;
}

.client-access-detail {
  padding-bottom: 15px;
}

.detail-overview,
.detail-block {
  margin-bottom: 15px;
}

.connection-parameters :deep(.el-descriptions__table) {
  table-layout: fixed;
}

.connection-parameters :deep(.el-descriptions__label) {
  color: var(--color-icon-primary);
  font-size: 12px;
  font-weight: 400;
}

.connection-parameters
  :deep(.el-descriptions__table .el-descriptions__cell.el-descriptions__content) {
  color: var(--color-text-primary);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.material-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.material-heading--spaced {
  margin-top: 24px;
}

.material-heading h4 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 600;
}

pre {
  max-width: 100%;
  margin: 0;
  padding: 14px 16px;
  overflow: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-fill-color-lighter);
  color: var(--color-text-primary);
  font-size: 12px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 767px) {
  .material-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .client-access-detail {
    padding: 10px;
  }
}
</style>
