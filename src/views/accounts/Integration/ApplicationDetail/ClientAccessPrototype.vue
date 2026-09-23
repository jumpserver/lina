<template>
  <div class="client-access-page">
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
        :configuration="editingConfiguration"
        :credential="object"
        @saved="handleConfigurationSaved"
        @submitting="saving = $event"
      />
    </Drawer>

    <template v-if="viewMode === 'detail' && selectedConfiguration">
      <div v-if="selectedConfiguration" class="client-access-detail">
        <ActionsGroup :actions="detailPageActions" class="client-access-detail-actions" />
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
        <el-empty
          v-if="!generated"
          :description="
            $t(
              selectedConfiguration.type === 'agent'
                ? 'GenerateAgentMaterialHelp'
                : 'GenerateAccessMaterialHelp'
            )
          "
        >
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
                <el-button link type="primary" @click="downloadConfiguration">
                  {{ $t('Download') }}
                </el-button>
              </div>
            </div>
            <div class="code-block">
              <div class="code-block__header">
                <span>python</span>
                <button type="button" @click="copyText(configurationText)">
                  {{ $t('Copy') }}
                </button>
              </div>
              <pre><code>{{ configurationText }}</code></pre>
            </div>
            <template v-if="selectedConfiguration.type === 'sdk'">
              <div class="material-heading material-heading--spaced">
                <h4>{{ $t('InstallCommand') }}</h4>
              </div>
              <div class="code-block">
                <div class="code-block__header">
                  <span>bash</span>
                  <button type="button" @click="copyText(installCommand)">
                    {{ $t('Copy') }}
                  </button>
                </div>
                <pre><code>{{ installCommand }}</code></pre>
              </div>
            </template>
          </template>

          <template v-if="selectedConfiguration.type === 'sdk'">
            <div class="material-heading material-heading--spaced">
              <div>
                <h4>{{ $t('MinimalCode') }}</h4>
                <p>{{ $t('MinimalCodeHelp') }}</p>
              </div>
            </div>
            <div class="code-block">
              <div class="code-block__header">
                <span>python</span>
                <button type="button" @click="copyText(executionText)">
                  {{ $t('Copy') }}
                </button>
              </div>
              <pre><code>{{ executionText }}</code></pre>
            </div>
          </template>
          <ol v-else class="agent-steps">
            <li>
              <h4>{{ $t('AgentInstallStep') }}</h4>
              <p>{{ $t('AgentInstallStepHelp') }}</p>
              <div class="code-block">
                <div class="code-block__header">
                  <span>bash</span>
                  <button type="button" @click="copyText(agentPreparationCommand)">
                    {{ $t('Copy') }}
                  </button>
                </div>
                <pre><code>{{ agentPreparationCommand }}</code></pre>
              </div>
            </li>
            <li>
              <h4>{{ $t('AgentRegisterStep') }}</h4>
              <p>{{ $t('AgentRegisterStepHelp') }}</p>
              <el-button type="primary" @click="copyText(agentRegistrationCommand)">
                {{ $t('CopyAgentRegistrationCommand') }}
              </el-button>
              <el-button :disabled="generating" @click="generateMaterials">
                {{ $t('RegenerateAgentRegistrationCommand') }}
              </el-button>
              <details class="registration-details">
                <summary>{{ $t('ViewAgentRegistrationCommand') }}</summary>
                <div class="code-block">
                  <div class="code-block__header"><span>bash</span></div>
                  <pre><code>{{ agentRegistrationCommand }}</code></pre>
                </div>
              </details>
            </li>
            <li>
              <h4>{{ $t('AgentVerifyStep') }}</h4>
              <p>{{ $t('AgentVerifyStepHelp') }}</p>
            </li>
          </ol>
        </template>
      </IBox>
    </Drawer>
  </div>
</template>

<script lang="jsx">
import { IBox, ListTable } from '@/components'
import ActionsGroup from '@/components/Common/ActionsGroup'
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
  name: 'CredentialClientAccess',
  components: {
    ActionsGroup,
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
  data() {
    return {
      configurationFileName: 'jms_pam_config.py',
      configurationText: '',
      editingConfiguration: null,
      executionText: '',
      agentPreparationCommand: '',
      agentRegistrationCommand: '',
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
        extraQuery: { credentials: this.object.id },
        hasSelection: false,
        hasPagination: true,
        columns: [
          {
            prop: 'application_name',
            label: this.$t('Application'),
            minWidth: '160px'
          },
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
            prop: 'client_version',
            label: this.$t('ClientVersion'),
            width: 130,
            formatter: (row) =>
              row.client_version
                ? `${row.client_version} / P${row.protocol_version}`
                : this.$t('Unknown')
          },
          {
            prop: 'sync_status',
            label: this.$t('ConfigurationSync'),
            minWidth: 150,
            formatter: (row) => {
              if (row.upgrade_required) return this.$t('ClientUpgradeRequired')
              if (!row.sync_status) return '-'
              const label = this.$t(row.sync_status === 'success' ? 'SyncSuccess' : 'SyncFailed')
              if (row.sync_status !== 'success') {
                return row.sync_error ? `${label}: ${row.sync_error}` : label
              }
              return row.configuration_current === false ? this.$t('ConfigurationPending') : label
            }
          },
          {
            prop: 'date_last_synced',
            label: this.$t('LastSyncedAt'),
            width: 175,
            formatter: (row) => this.formatDate(row.date_last_synced)
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
      return this.configurationFileName
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
          key: this.$t('AgentDeliveryMode'),
          value: this.$t(
            {
              json: 'AgentDeliveryJSON',
              environment: 'AgentDeliveryEnvironment',
              socket: 'AgentDeliverySocket'
            }[item.delivery_mode] || 'Unknown'
          ),
          has: item.type === 'agent'
        },
        {
          key: this.$t('SystemdUnit'),
          value: `${item.systemd_unit} · ${this.$t(
            item.systemd_action === 'reload' ? 'Reload' : 'Restart'
          )}`,
          has: item.type === 'agent' && item.delivery_mode === 'environment'
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
        { key: this.$t('ApplicationID'), value: this.selectedConfiguration?.application?.id },
        { key: this.$t('OrganizationID'), value: this.currentOrg?.id || '-' }
      ]
    }
  },
  watch: {
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
        this.tableConfig.extraQuery = { credentials: id }
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
      if (!configuration.credentials.some((credential) => credential.id === this.object.id)) {
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
      await this.loadData()
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
        await this.backToList()
      } else {
        await this.loadData()
      }
      this.$message.success(this.$t('DeleteSuccessMsg'))
    },
    copyText(value) {
      copy(value)
    },
    clearMaterials() {
      this.generated = false
      this.configurationFileName = 'jms_pam_config.py'
      this.configurationText = ''
      this.executionText = ''
      this.agentPreparationCommand = ''
      this.agentRegistrationCommand = ''
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
        this.configurationText = materials.config || ''
        this.configurationFileName = materials.filename || 'jms_pam_config.py'
        this.installCommand = materials.install_command
        this.executionText = materials.code || ''
        this.agentPreparationCommand = materials.preparation_command || ''
        this.agentRegistrationCommand = materials.registration_command || ''
        this.generated = true
        this.$message.success(this.$t('ConfigurationGenerated'))
      } finally {
        this.generating = false
      }
    },
    async toggleInstance(row) {
      let reason = ''
      if (row.is_active) {
        const rotating = row.credential_statuses?.some(
          (item) => (item.credential.status?.value || item.credential.status) !== 'idle'
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
      this.$refs.instancesTable.reloadTable()
    },
    downloadConfiguration() {
      const blob = new Blob([this.configurationText], { type: 'text/x-python;charset=utf-8' })
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
.material-heading p {
  margin: 4px 0 0;
  color: var(--color-help-text);
  font-size: 12px;
  line-height: 1.5;
}

.client-access-detail {
  padding-bottom: 15px;
}

.client-access-detail-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
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

.agent-steps {
  margin: 0;
  padding-left: 22px;
}

.agent-steps li + li {
  margin-top: 24px;
}

.agent-steps h4 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 14px;
}

.agent-steps p {
  margin: 6px 0 12px;
  color: var(--color-help-text);
  font-size: 12px;
  line-height: 1.5;
}

.registration-details {
  margin-top: 12px;
}

.registration-details summary {
  width: fit-content;
  margin-bottom: 10px;
  color: var(--el-color-primary);
  cursor: pointer;
  font-size: 12px;
}

.registration-details summary:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

.code-block {
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

.code-block__header {
  display: flex;
  min-height: 36px;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  color: var(--color-text-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

.code-block__header button {
  min-width: 44px;
  min-height: 28px;
  padding: 4px 8px;
  border: 0;
  border-radius: 4px;
  color: var(--el-color-primary);
  background: transparent;
  cursor: pointer;
  font: inherit;
}

.code-block__header button:hover {
  background: var(--el-color-primary-light-9);
}

.code-block__header button:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

.code-block pre {
  border: 0;
  border-radius: 0;
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
