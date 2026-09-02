<template>
  <div class="client-access-prototype">
    <IBox :title="$t('ClientInstances')" class="detail-block client-instances-card">
      <GenericListTable
        ref="clientTable"
        :header-actions="clientHeaderActions"
        :table-config="clientTableConfig"
      />
    </IBox>

    <Drawer v-model:visible="accessDrawerVisible" :has-footer="false" :title="$t('ClientAccess')">
      <div class="access-drawer-content">
        <TwoCol :gutter="20" :left="17" :right="7" class="overview-layout">
          <DetailCard
            :items="connectionItems"
            :title="$t('ConnectionParameters')"
            class="overview-card"
          />
          <template #right>
            <QuickActions
              :actions="accessActions"
              :title="$t('CurrentAction')"
              class="overview-actions"
            />
          </template>
        </TwoCol>

        <IBox :title="$t('CurrentAccessMode')" class="detail-block access-guide-card">
          <el-tabs v-model="activeMode">
            <el-tab-pane :label="$t('PythonSDK')" name="sdk">
              <el-row :gutter="20">
                <el-col :lg="12" :md="24" :sm="24" :xs="24">
                  <section class="access-section">
                    <div class="section-heading">
                      <h4>{{ $t('EnvironmentVariables') }}</h4>
                      <el-button link type="primary" @click="copyText(environmentVariables)">
                        {{ $t('Copy') }}
                      </el-button>
                    </div>
                    <pre><code>{{ environmentVariables }}</code></pre>

                    <div class="section-heading section-heading--spaced">
                      <h4>{{ $t('InstallCommand') }}</h4>
                      <el-button link type="primary" @click="copyText(sdkInstallCommand)">
                        {{ $t('Copy') }}
                      </el-button>
                    </div>
                    <pre><code>{{ sdkInstallCommand }}</code></pre>
                  </section>
                </el-col>
                <el-col :lg="12" :md="24" :sm="24" :xs="24">
                  <section class="access-section">
                    <div class="section-heading">
                      <h4>{{ $t('PythonSDK') }}</h4>
                      <el-button link type="primary" @click="copyText(sdkCode)">
                        {{ $t('Copy') }}
                      </el-button>
                    </div>
                    <p>{{ $t('SDKDescription') }}</p>
                    <pre class="code-sample"><code>{{ sdkCode }}</code></pre>
                  </section>
                </el-col>
              </el-row>
            </el-tab-pane>

            <el-tab-pane :label="$t('AgentAccess')" name="agent">
              <el-row :gutter="20">
                <el-col :lg="14" :md="24" :sm="24" :xs="24">
                  <section class="access-section">
                    <p>{{ $t('AgentDescription') }}</p>
                    <template v-if="!agentOnline">
                      <div class="section-heading section-heading--spaced">
                        <h4>{{ $t('InstallCommand') }}</h4>
                        <el-button link type="primary" @click="copyText(agentInstallCommand)">
                          {{ $t('Copy') }}
                        </el-button>
                      </div>
                      <pre><code>{{ agentInstallCommand || $t('GenerateAgentCommandHelp') }}</code></pre>
                      <el-button
                        class="section-action"
                        type="primary"
                        @click="generateAgentCommand"
                      >
                        {{
                          registrationToken
                            ? $t('RegenerateToken')
                            : $t('GenerateRegistrationToken')
                        }}
                      </el-button>
                    </template>
                    <el-alert
                      v-else
                      :closable="false"
                      :title="$t('AgentRegistrationComplete')"
                      class="section-heading--spaced"
                      show-icon
                      type="success"
                    />
                  </section>
                </el-col>
                <el-col :lg="10" :md="24" :sm="24" :xs="24">
                  <section class="access-section agent-parameters">
                    <div class="parameter-row">
                      <span>{{ $t('CredentialKey') }}</span>
                      <el-select
                        v-model="agentCredentialKeys"
                        :placeholder="$t('SelectCredentialKeys')"
                        filterable
                        multiple
                      >
                        <el-option
                          v-for="policy in availablePolicies"
                          :key="policy.id"
                          :label="`${policy.name} (${policy.key})`"
                          :value="policy.key"
                        />
                      </el-select>
                    </div>
                    <div class="parameter-row">
                      <span>{{ $t('ApplicationRunUser') }}</span>
                      <el-input v-model="agentAppUser" placeholder="app-user" />
                    </div>
                    <div v-if="registrationToken && !agentOnline" class="parameter-row">
                      <span>{{ $t('RegistrationToken') }}</span>
                      <CopyValue :value="registrationToken" />
                    </div>
                    <div class="parameter-row">
                      <span>{{ $t('LocalEndpoint') }}</span>
                      <CopyValue :value="localEndpoint" />
                    </div>
                  </section>
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </IBox>
      </div>
    </Drawer>
  </div>
</template>

<script>
import { defineComponent, h } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import DetailCard from '@/components/Cards/DetailCard/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import { IBox, QuickActions } from '@/components'
import { DateFormatter, TagChoicesFormatter } from '@/components/Table/TableFormatters'
import GenericListTable from '@/layout/components/GenericListTable'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { BASE_URL, copy } from '@/utils/common/index'
import { mapGetters } from 'vuex'
import {
  createAgentRegistration,
  listCredentialBindings,
  listCredentialClients,
  listCredentialPolicies,
  updateIntegrationApplication
} from '@/api/accountRotation'

const valueOf = (value) => value?.value ?? value
const resultsOf = (value) => (Array.isArray(value) ? value : value?.results || [])

const CopyValue = defineComponent({
  name: 'PrototypeCopyValue',
  props: {
    value: {
      type: String,
      default: '-'
    }
  },
  setup(props) {
    return () =>
      h(
        'button',
        {
          class: 'copy-value-button',
          type: 'button',
          title: props.value,
          onClick: () => copy(props.value)
        },
        [h('span', props.value), h(CopyDocument)]
      )
  }
})

export default {
  name: 'IntegrationApplicationClientAccessPrototype',
  components: {
    CopyValue,
    DetailCard,
    Drawer,
    GenericListTable,
    IBox,
    QuickActions,
    TwoCol
  },
  props: {
    object: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      activeMode: 'sdk',
      configuredMode: 'sdk',
      applicationSecret: '',
      accessDrawerVisible: false,
      bindings: [],
      clients: [],
      policies: [],
      agentCredentialKeys: [],
      agentAppUser: '',
      registrationToken: '',
      agentInstallCommand: '',
      baseUrl: BASE_URL,
      clientTableConfig: {
        url: '/api/v1/accounts/credential-client-instances/',
        hasSelection: false,
        columns: ['instance_id', 'type', 'online', 'date_last_seen', 'is_active', 'actions'],
        columnsShow: {
          min: ['instance_id', 'online', 'actions'],
          default: ['instance_id', 'type', 'online', 'date_last_seen', 'is_active', 'actions']
        },
        columnsMeta: {
          instance_id: {
            label: this.$t('InstanceID'),
            minWidth: 180
          },
          type: {
            label: this.$t('ClientType')
          },
          online: {
            label: this.$t('ClientStatus'),
            formatter: TagChoicesFormatter,
            formatterArgs: {
              getTagLabel: ({ cellValue }) => (cellValue ? this.$t('Online') : this.$t('Offline')),
              getTagType: ({ cellValue }) => (cellValue ? 'success' : 'info')
            }
          },
          date_last_seen: {
            label: this.$t('LastReportedAt'),
            formatter: DateFormatter,
            minWidth: 170
          },
          is_active: {
            label: this.$t('EnableStatus'),
            formatter: TagChoicesFormatter,
            formatterArgs: {
              getTagLabel: ({ cellValue }) =>
                cellValue ? this.$t('Enabled') : this.$t('Disabled'),
              getTagType: ({ cellValue }) => (cellValue ? 'success' : 'info')
            }
          },
          actions: {
            label: this.$t('Actions'),
            width: 120,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: ({ row }) => !row.online,
              canDelete: () => this.$hasPerm('accounts.delete_credentialclientinstance'),
              afterDelete: this.loadAccessData,
              hasClone: false,
              squareButtons: true,
              extraActions: [
                {
                  name: 'ToggleClient',
                  title: ({ row }) => (row.is_active ? this.$t('Disable') : this.$t('Enable')),
                  icon: ({ row }) => (row.is_active ? 'fa-solid fa-ban' : 'fa-circle-check'),
                  order: 10,
                  type: 'primary',
                  has: ({ row }) => !row.is_active || !row.online,
                  can: () => this.$hasPerm('accounts.change_credentialclientinstance'),
                  callback: this.toggleClient
                }
              ]
            }
          }
        }
      },
      clientHeaderActions: {
        hasSearch: true,
        hasRefresh: true,
        hasLeftActions: true,
        hasRightActions: true,
        hasExport: false,
        hasImport: false,
        hasCreate: true,
        hasMoreActions: false,
        createTitle: this.$t('ClientAccess'),
        onCreate: () => {
          this.accessDrawerVisible = true
        },
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  },
  computed: {
    ...mapGetters(['currentOrg']),
    applicationId() {
      return this.object.id || ''
    },
    organizationId() {
      return this.currentOrg?.id || '-'
    },
    allowedSourceIp() {
      const groups = this.object.ip_group || []
      return groups.length ? groups.join(', ') : '*'
    },
    agentOnline() {
      return this.clients.some((client) => valueOf(client.type) === 'agent' && client.online)
    },
    latestClient() {
      return [...this.clients].sort((a, b) =>
        String(b.date_last_seen || '').localeCompare(String(a.date_last_seen || ''))
      )[0]
    },
    availablePolicies() {
      const accounts = this.object.accounts
      if (accounts?.type !== 'ids') return this.policies
      const ids = new Set(accounts.ids || [])
      return this.policies.filter(
        (policy) => ids.has(policy.primary_account?.id) && ids.has(policy.backup_account?.id)
      )
    },
    firstCredentialKey() {
      return this.bindings[0]?.credentialKey || '<CREDENTIAL_KEY>'
    },
    connectionItems() {
      return [
        { key: this.$t('JumpServerAddress'), value: this.baseUrl, component: CopyValue },
        { key: this.$t('ApplicationID'), value: this.applicationId, component: CopyValue },
        { key: this.$t('OrganizationID'), value: this.organizationId, component: CopyValue },
        { key: this.$t('AccessIP'), value: this.allowedSourceIp },
        {
          key: this.$t('ApplicationSecret'),
          value: this.applicationSecret || this.$t('ClickGetApplicationSecret'),
          component: CopyValue
        },
        {
          key: this.$t('CurrentAccessMode'),
          value: this.configuredMode === 'sdk' ? this.$t('PythonSDK') : this.$t('AgentAccess')
        },
        {
          key: this.$t('ClientStatus'),
          value: this.latestClient?.online
            ? this.configuredMode === 'agent'
              ? this.$t('AgentOnline')
              : this.$t('Online')
            : this.configuredMode === 'agent'
              ? this.$t('AgentOffline')
              : this.$t('Offline')
        },
        {
          key: this.$t('LastReportedAt'),
          value: this.latestClient?.date_last_seen || '-'
        }
      ]
    },
    accessActions() {
      return [
        {
          title: this.$t('CurrentAccessMode'),
          attrs: {
            type: 'primary',
            disabled: !this.$hasPerm('accounts.change_integrationapplication'),
            label: this.configuredMode === 'sdk' ? this.$t('SwitchToAgent') : this.$t('SwitchToSDK')
          },
          callbacks: { click: this.switchAccessMode }
        },
        {
          title: this.$t('ApplicationSecret'),
          attrs: { type: 'primary', label: this.$t('View') },
          callbacks: { click: this.getApplicationSecret }
        }
      ]
    },
    environmentVariables() {
      return [
        `JMS_URL=${this.baseUrl}`,
        `JMS_APP_ID=${this.applicationId}`,
        `JMS_APP_SECRET=${this.applicationSecret || '<APPLICATION_SECRET>'}`,
        `JMS_ORG_ID=${this.organizationId}`
      ].join('\n')
    },
    sdkInstallCommand() {
      return `python3 -m pip install ${this.baseUrl}/api/v1/accounts/python-sdk/`
    },
    sdkCode() {
      return [
        'from jms_pam import JumpServerPAMClient',
        'import os',
        '',
        'client = JumpServerPAMClient(',
        "    endpoint=os.environ['JMS_URL'],",
        "    app_id=os.environ['JMS_APP_ID'],",
        "    app_secret=os.environ['JMS_APP_SECRET'],",
        "    org_id=os.environ['JMS_ORG_ID'],",
        ')',
        `credential = client.get_credential("${this.firstCredentialKey}")`,
        '# 应用连接成功后显式确认，心跳会继续上报使用状态',
        'client.confirm_applied(credential)'
      ].join('\n')
    },
    localEndpoint() {
      return 'http://127.0.0.1:8081/v1/health'
    }
  },
  watch: {
    applicationId: {
      immediate: true,
      handler(applicationId) {
        if (!applicationId) return
        this.clientTableConfig.url = `/api/v1/accounts/credential-client-instances/?application=${applicationId}`
        this.configuredMode = valueOf(this.object.credential_access_mode) || 'sdk'
        this.activeMode = this.configuredMode
        this.loadAccessData()
      }
    },
    'object.credential_access_mode'(mode) {
      this.configuredMode = valueOf(mode) || 'sdk'
      this.activeMode = this.configuredMode
    }
  },
  methods: {
    copyText(value) {
      copy(value)
    },
    async loadAccessData() {
      const [bindingData, clientData, policyData] = await Promise.all([
        listCredentialBindings({ application: this.applicationId, limit: 100 }),
        listCredentialClients({ application: this.applicationId, limit: 100 }),
        listCredentialPolicies({ limit: 100 })
      ])
      this.clients = resultsOf(clientData)
      const policies = resultsOf(policyData)
      this.policies = policies
      this.bindings = resultsOf(bindingData).map((binding) => {
        const policy = policies.find((item) => item.id === binding.policy?.id) || binding.policy
        return { credentialKey: policy.key }
      })
      if (!this.agentCredentialKeys.length) {
        this.agentCredentialKeys = this.bindings.map((item) => item.credentialKey)
      }
    },
    async generateAgentCommand() {
      if (!this.agentCredentialKeys.length || !this.agentAppUser) {
        this.$message.warning(this.$t('AgentParametersRequired'))
        return
      }
      if (this.configuredMode !== 'agent') await this.selectAccessMode('agent')
      const data = await createAgentRegistration(this.applicationId, {
        credential_keys: this.agentCredentialKeys,
        app_user: this.agentAppUser,
        instance_id: `${this.object.name || 'application'}-agent`
      })
      this.registrationToken = data.token
      this.agentInstallCommand = data.install_command
      this.$message.success(this.$t('GenerateSuccessMsg'))
    },
    async selectAccessMode(mode) {
      await updateIntegrationApplication(this.applicationId, {
        credential_access_mode: mode
      })
      this.configuredMode = mode
      this.activeMode = mode
      this.object.credential_access_mode = mode
      this.$message.success(this.$t('UpdateSuccessMsg'))
    },
    async switchAccessMode() {
      const mode = this.configuredMode === 'sdk' ? 'agent' : 'sdk'
      await this.selectAccessMode(mode)
    },
    async toggleClient({ row, reload }) {
      await this.$axios.patch(`/api/v1/accounts/credential-client-instances/${row.id}/`, {
        is_active: !row.is_active
      })
      reload()
      await this.loadAccessData()
      this.$message.success(this.$t('UpdateSuccessMsg'))
    },
    async getApplicationSecret() {
      const data = await this.$axios.get(
        `/api/v1/accounts/integration-applications/${this.applicationId}/secret/`
      )
      this.applicationSecret = data.secret
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-block {
  margin-bottom: 15px;
}

.access-drawer-content {
  padding: 15px;
}

.overview-layout {
  margin-bottom: 15px;
}

.overview-layout :deep(.el-col) {
  display: flex;
}

.overview-card,
.overview-actions {
  width: 100%;
  height: 100%;
}

.access-guide-card :deep(.el-card__body) {
  padding-top: 4px;
}

.client-instances-card :deep(.list-table) {
  margin-bottom: 0;
}

.access-section {
  min-width: 0;
  padding: 12px 0 4px;
}

.access-section p {
  margin: 0 0 14px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.section-heading--spaced {
  margin-top: 20px;
}

.section-heading h4 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 500;
}

pre {
  max-width: 100%;
  margin: 0;
  padding: 12px 14px;
  overflow: auto;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
  color: var(--color-text-primary);
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.code-sample {
  min-height: 176px;
}

.section-action {
  margin-top: 12px;
}

.agent-parameters {
  padding-top: 16px;
}

.parameter-row {
  padding: 10px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}

.parameter-row > span:first-child {
  display: block;
  margin-bottom: 5px;
  color: var(--color-help-text);
  font-size: 12px;
}

.parameter-row :deep(.el-select) {
  width: 100%;
}

.agent-parameters > .el-button {
  margin-top: 16px;
}

:deep(.copy-value-button) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-link);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

:deep(.copy-value-button span) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.copy-value-button svg) {
  flex: 0 0 auto;
  width: 13px;
  height: 13px;
}

@media (max-width: 991px) {
  .overview-layout :deep(.el-col) {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .overview-layout :deep(.el-col + .el-col) {
    margin-top: 15px;
  }
}

@media (max-width: 767px) {
  .client-access-prototype {
    width: calc(100vw - 40px);
    min-width: 0;
  }
}
</style>
