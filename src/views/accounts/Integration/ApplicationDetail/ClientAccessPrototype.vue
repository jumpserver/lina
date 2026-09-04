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
        :application="object"
        :configuration="editingConfiguration"
        @cancel="formVisible = false"
        @saved="handleConfigurationSaved"
        @submitting="saving = $event"
      />
    </Drawer>

    <template v-if="viewMode === 'detail' && selectedConfiguration">
      <div v-if="selectedConfiguration" class="client-access-detail">
        <TwoCol :gutter="20" :left="16" :right="8" class="detail-overview">
          <DetailCard :items="connectionItems" :title="$t('ConnectionParameters')" />
          <template #right>
            <QuickActions :actions="detailActions" :title="$t('CurrentAction')" />
          </template>
        </TwoCol>

        <IBox :title="$t('ClientInstances')" class="detail-block">
          <DataTable ref="instancesTable" :config="instanceTableConfig" />
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
            <h4>{{ $t('InstallCommand') }}</h4>
            <pre><code>{{ installCommand }}</code></pre>
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
import { IBox, ListTable, QuickActions } from '@/components'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import Drawer from '@/components/Drawer/index.vue'
import DetailCard from '@/components/Cards/DetailCard/index.vue'
import DataTable from '@/components/Table/DataTable/index.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
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
    DataTable,
    DetailCard,
    Drawer,
    IBox,
    ListTable,
    QuickActions,
    TwoCol
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
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
            prop: 'credentials',
            label: this.$t('ApplicationCredentials'),
            minWidth: '240px',
            formatter: (row) => row.credentials.map((item) => item.name).join(', ')
          },
          {
            prop: 'instances',
            label: this.$t('ClientInstances'),
            width: '110px'
          },
          {
            prop: 'status',
            label: this.$t('ClientStatus'),
            width: '110px',
            formatter: (row) => (
              <el-tag type={row.status === 'online' ? 'success' : 'info'}>
                {row.status === 'disabled'
                  ? this.$t('Disabled')
                  : row.status === 'online'
                    ? this.$t('Online')
                    : this.$t('Offline')}
              </el-tag>
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
    canGenerate() {
      return (
        this.selectedConfiguration?.is_active &&
        this.$hasPerm('accounts.change_clientaccessconfiguration') &&
        this.$hasPerm('accounts.change_integrationapplication')
      )
    },
    instanceTableConfig() {
      return {
        url: '/api/v1/accounts/credential-client-instances/',
        extraQuery: { configuration: this.selectedConfiguration.id },
        hasSelection: false,
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
          key: this.$t('ApplicationCredentials'),
          value: (item.credentials || [])
            .map((credential) => `${credential.name} · ${credential.key}`)
            .join('\n')
        },
        { key: this.$t('ClientAccessConfigurationID'), value: item.id },
        { key: this.$t('JumpServerAddress'), value: BASE_URL },
        { key: this.$t('ApplicationID'), value: this.object.id },
        { key: this.$t('OrganizationID'), value: this.currentOrg?.id || '-' },
        {
          key: this.$t('ClientStatus'),
          value:
            item.status === 'disabled'
              ? this.$t('Disabled')
              : item.status === 'online'
                ? this.$t('Online')
                : this.$t('Offline')
        },
        { key: this.$t('LastReportedAt'), value: this.formatDate(item.last_reported) }
      ]
    },
    detailActions() {
      return [
        {
          title: this.$t('GeneratedAccessMaterial'),
          has: this.canGenerate,
          attrs: {
            type: 'primary',
            label: this.$t('GenerateConfiguration'),
            loading: this.generating
          },
          callbacks: { click: this.generateMaterials }
        },
        {
          title: this.$t('Configuration'),
          has: this.$hasPerm('accounts.change_clientaccessconfiguration'),
          attrs: { label: this.$t('Edit') },
          callbacks: { click: () => this.openEdit(this.selectedConfiguration) }
        }
      ]
    }
  },
  watch: {
    'object.id': {
      immediate: true,
      async handler(id) {
        if (id) await this.loadData()
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
    openCreate() {
      this.editingConfiguration = null
      this.formVisible = true
    },
    async openEdit(row) {
      this.editingConfiguration = await getClientAccessConfiguration(row.id)
      this.formVisible = true
    },
    async openDetail(row) {
      this.selectedConfiguration = await getClientAccessConfiguration(row.id)
      this.clearMaterials()
      this.viewMode = 'detail'
    },
    async handleConfigurationSaved(saved) {
      this.formVisible = false
      await this.loadData()
      if (this.viewMode === 'detail') await this.openDetail(saved)
    },
    async remove(row) {
      await this.$confirm(
        this.$t('DeleteClientAccessConfirm', { name: row.name }),
        this.$t('Warning'),
        { type: 'warning' }
      )
      await deleteClientAccessConfiguration(row.id)
      await this.loadData()
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
      await this.$refs.instancesTable.getList()
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
