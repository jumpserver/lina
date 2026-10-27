<template>
  <Page class="drawer" hide-heading>
    <IBox>
      <div class="application-access-wizard">
        <el-steps :active="step" finish-status="success" align-center>
          <el-step :title="$t('AccessChooseMethod')" />
          <el-step :title="$t('AccessGetMaterials')" />
          <el-step :title="$t('AccessVerifyConnection')" />
        </el-steps>
        <p class="context-help">{{ object.name }} · {{ $t('ApplicationAccessWizardHelp') }}</p>
        <el-form
          v-if="step === 0"
          ref="form"
          :model="form"
          label-position="top"
          @submit.prevent="generate"
        >
          <el-form-item :label="$t('ClientType')">
            <el-radio-group v-model="form.type">
              <el-radio value="sdk">{{ $t('SDKAccess') }}</el-radio>
              <el-radio value="agent">{{ $t('AgentAccess') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <template v-if="form.type === 'sdk'">
            <el-form-item
              :label="$t('SDKProgrammingLanguage')"
              prop="sdk_language"
              :error="errors.sdk_language"
            >
              <el-select v-model="form.sdk_language">
                <el-option
                  v-for="language in sdkLanguages"
                  :key="language.value"
                  :label="language.label"
                  :value="language.value"
                />
              </el-select>
            </el-form-item>
            <p class="context-help">{{ $t('AccessSDKHelp') }}</p>
          </template>
          <template v-else>
            <el-form-item :label="$t('AgentSetupGoal')">
              <el-select v-model="form.agent_setup">
                <el-option :label="$t('AgentSetupDelivery')" value="delivery" />
                <el-option :label="$t('AgentSetupConfigUpdate')" value="config_update" />
                <el-option :label="$t('AlternatingAccountRotation')" value="rotation" />
              </el-select>
            </el-form-item>
            <el-form-item
              :label="$t('ApplicationRunUser')"
              prop="app_user"
              :error="errors.app_user"
              :rules="[{ required: true, message: $t('Required'), trigger: 'blur' }]"
            >
              <el-input v-model="form.app_user" placeholder="app" maxlength="128" />
            </el-form-item>
            <el-form-item
              :label="$t('InstallPath')"
              prop="install_path"
              :error="errors.install_path"
              :rules="[{ required: true, message: $t('Required'), trigger: 'blur' }]"
            >
              <el-input v-model="form.install_path" maxlength="256" />
            </el-form-item>
            <el-form-item
              :label="$t('AgentStoreScope')"
              prop="store_scope"
              :error="errors.store_scope"
            >
              <el-select v-model="form.store_scope">
                <el-option :label="$t('AgentStoreNone')" value="none" />
                <el-option :label="$t('AgentStoreAll')" value="all" />
                <el-option :label="$t('AgentStoreSelected')" value="selected" />
              </el-select>
              <p class="field-help">{{ $t('AgentStoreScopeHelp') }}</p>
            </el-form-item>
            <el-form-item
              v-if="form.store_scope === 'selected'"
              :label="$t('Accounts')"
              prop="store_accounts"
              :error="errors.store_accounts"
            >
              <Select2
                v-model="form.store_accounts"
                :multiple="true"
                :url="`/api/v1/accounts/accounts/?integrationapplication=${object.id}&fields=id,name,username,asset`"
                :ajax="{ transformOption: accountOption }"
              />
            </el-form-item>
            <el-form-item v-if="form.store_scope !== 'none'" :label="$t('AgentStoreFormat')">
              <el-select v-model="form.store_format">
                <el-option :label="$t('DeliveryJSON')" value="json" />
                <el-option :label="$t('DeliveryEnvironment')" value="environment" />
              </el-select>
            </el-form-item>
            <template v-if="form.agent_setup !== 'delivery'">
              <el-form-item
                :label="$t('AgentServiceName')"
                prop="service_name"
                :error="errors.service_name"
              >
                <el-input v-model="form.service_name" placeholder="sample-app" maxlength="128" />
              </el-form-item>
              <el-form-item :label="$t('AgentFollowAccountSwitch')">
                <el-switch
                  v-model="form.allow_account_switch"
                  :disabled="form.agent_setup === 'rotation'"
                />
              </el-form-item>
              <el-form-item :label="$t('AgentUpdateOnNotification')">
                <el-switch v-model="form.update_on_notification" />
                <p class="field-help">{{ $t('AgentUpdateOnNotificationHelp') }}</p>
              </el-form-item>
              <p v-if="errors.service_accounts" class="field-help">{{ errors.service_accounts }}</p>
              <div
                v-for="(account, index) in form.service_accounts"
                :key="index"
                class="service-account"
              >
                <el-form-item
                  :label="$t('Account')"
                  :prop="`service_accounts.${index}.account_id`"
                  :rules="[{ required: true, message: $t('Required'), trigger: 'change' }]"
                >
                  <Select2
                    v-model="account.account_id"
                    :multiple="false"
                    :url="`/api/v1/accounts/accounts/?integrationapplication=${object.id}&fields=id,name,username,asset`"
                    :ajax="{ transformOption: accountOption }"
                  />
                </el-form-item>
                <el-form-item
                  :label="$t('AgentAccountAlias')"
                  :prop="`service_accounts.${index}.alias`"
                  :rules="
                    form.service_accounts.length > 1
                      ? [{ required: true, message: $t('Required'), trigger: 'blur' }]
                      : []
                  "
                >
                  <el-input
                    v-model="account.alias"
                    :placeholder="index === 0 ? 'database' : 'cache'"
                  />
                  <p class="field-help">{{ $t('AgentAccountAliasHelp') }}</p>
                </el-form-item>
                <el-form-item :label="$t('AgentUsernameField')">
                  <el-input v-model="account.username_field" placeholder="DB_USER" />
                </el-form-item>
                <el-form-item :label="$t('AgentSecretField')">
                  <el-input v-model="account.secret_field" placeholder="DB_PASSWORD" />
                </el-form-item>
                <el-button
                  v-if="form.service_accounts.length > 1"
                  @click="form.service_accounts.splice(index, 1)"
                  >{{ $t('Remove') }}</el-button
                >
              </div>
              <el-button
                :disabled="form.service_accounts.length >= 20"
                @click="addServiceAccount"
                >{{ $t('AgentAddAccount') }}</el-button
              >
              <el-form-item
                :label="$t('AgentBusinessConfigFile')"
                prop="config_file"
                :error="errors.config_file"
                :rules="[{ required: true, message: $t('Required'), trigger: 'blur' }]"
              >
                <el-input v-model="form.config_file" placeholder="/etc/app/config.yml" />
              </el-form-item>
              <el-form-item :label="$t('AgentConfigFormat')">
                <el-select v-model="form.config_format">
                  <el-option :label="$t('AutoDetect')" value="auto" />
                  <el-option label="KEY=value" value="env" />
                  <el-option label="YAML" value="yaml" />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('Actions')">
                <el-select v-model="form.service_action_type">
                  <el-option :label="$t('AgentActionSystemd')" value="systemd" />
                  <el-option :label="$t('AgentActionScript')" value="script" />
                  <el-option :label="$t('AgentActionNone')" value="none" />
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="form.service_action_type === 'script'"
                :label="$t('AgentServiceScript')"
                prop="service_script"
                :error="errors.service_script"
                :rules="[{ required: true, message: $t('Required'), trigger: 'blur' }]"
              >
                <el-input
                  v-model="form.service_script"
                  placeholder="/usr/local/libexec/reload-app"
                />
              </el-form-item>
              <el-form-item
                :label="$t('AgentApplicationCheck')"
                prop="application_check"
                :error="errors.application_check"
                :rules="
                  form.agent_setup === 'rotation'
                    ? [{ required: true, message: $t('Required'), trigger: 'blur' }]
                    : []
                "
              >
                <el-input
                  v-model="form.application_check"
                  placeholder="/usr/local/libexec/check-app-db"
                />
                <p class="field-help">{{ $t('AgentApplicationCheckHelp') }}</p>
              </el-form-item>
            </template>
            <template v-if="needsSystemd">
              <el-form-item
                :label="$t('SystemdUnit')"
                prop="systemd_unit"
                :error="errors.systemd_unit"
                :rules="[{ required: true, message: $t('Required'), trigger: 'blur' }]"
              >
                <el-input v-model="form.systemd_unit" placeholder="app.service" maxlength="128" />
              </el-form-item>
              <el-form-item :label="$t('SystemdAction')">
                <el-radio-group v-model="form.systemd_action">
                  <el-radio value="restart">{{ $t('Restart') }}</el-radio>
                  <el-radio value="reload">{{ $t('Reload') }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </template>
          </template>
          <router-link
            :to="documentationRoute"
            target="_blank"
            rel="noopener noreferrer"
            class="documentation-link"
            >{{ $t('SDKCenter') }}</router-link
          >
          <el-alert v-if="errors.general" :title="errors.general" type="error" :closable="false" />
        </el-form>
        <div v-else-if="step === 1" class="access-materials">
          <el-alert
            :title="$t('AccessMaterialsSecretHelp')"
            type="warning"
            :closable="false"
            show-icon
          />
          <div class="material-header">
            <strong>{{ materials.filename }}</strong>
            <el-button @click="downloadConfiguration">{{ $t('Download') }}</el-button>
          </div>
          <p class="context-help">
            {{
              $t(
                form.type === 'agent'
                  ? 'AccessAgentConfigurationHelp'
                  : form.sdk_language === 'python'
                    ? 'AccessSDKConfigurationHelp'
                    : 'AccessSDKEnvironmentHelp'
              )
            }}
          </p>
          <p v-if="form.type === 'agent'" class="context-help">
            {{ $t('AccessAgentConfigUpdateHelp') }}
          </p>
          <template v-if="materials.instance_id">
            <div class="material-header">
              <strong>{{ $t('InstanceID') }}</strong>
              <el-button link type="primary" @click="copyText(materials.instance_id)">{{
                $t('Copy')
              }}</el-button>
            </div>
            <pre>{{ materials.instance_id }}</pre>
            <p class="context-help">{{ $t('AccessSDKHelp') }}</p>
          </template>
          <router-link
            :to="documentationRoute"
            target="_blank"
            rel="noopener noreferrer"
            class="documentation-link"
            >{{ $t('SDKCenter') }}</router-link
          >
          <div class="material-header">
            <strong>{{ $t(form.type === 'agent' ? 'AccessAgentLinuxService' : 'Install') }}</strong>
            <el-button link type="primary" @click="copyText(materials.install_command)">{{
              $t('Copy')
            }}</el-button>
          </div>
          <pre>{{ materials.install_command }}</pre>
          <template v-if="materials.foreground_unix_command">
            <p class="context-help">{{ $t('AccessAgentForegroundHelp') }}</p>
            <div class="material-header">
              <strong>{{ $t('AccessAgentForegroundUnix') }}</strong>
              <el-button link type="primary" @click="copyText(materials.foreground_unix_command)">{{
                $t('Copy')
              }}</el-button>
            </div>
            <pre>{{ materials.foreground_unix_command }}</pre>
            <div class="material-header">
              <strong>{{ $t('AccessAgentForegroundWindows') }}</strong>
              <el-button
                link
                type="primary"
                @click="copyText(materials.foreground_windows_command)"
                >{{ $t('Copy') }}</el-button
              >
            </div>
            <pre>{{ materials.foreground_windows_command }}</pre>
          </template>
          <p v-else-if="form.type === 'agent'" class="context-help">
            {{
              $t(
                form.agent_setup === 'delivery'
                  ? 'AccessAgentLinuxOnlyDeliveryHelp'
                  : 'AgentRulesLinuxHelp'
              )
            }}
          </p>
          <template v-if="materials.code">
            <div class="material-header">
              <strong>{{ $t('ExampleCode') }}</strong>
              <el-button link type="primary" @click="copyText(materials.code)">{{
                $t('Copy')
              }}</el-button>
            </div>
            <pre>{{ materials.code }}</pre>
          </template>
        </div>
        <div v-else v-loading="loading">
          <div class="material-header">
            <strong>{{
              $t('ConnectedInstancesSummary', { online: onlineAmount, total: instancesAmount })
            }}</strong>
            <el-button @click="loadInstances">{{ $t('Refresh') }}</el-button>
          </div>
          <p class="context-help">{{ $t('AccessVerifyHelp') }}</p>
          <el-alert
            v-if="verificationFailed"
            :title="$t('SelectLoadFailed')"
            type="error"
            :closable="false"
          />
          <DataTable :config="instanceTableConfig" />
          <el-pagination
            v-if="instancesAmount > 10"
            v-model:current-page="page"
            :page-size="10"
            :total="instancesAmount"
            layout="prev, pager, next"
            @current-change="loadInstances"
          />
        </div>
        <div class="wizard-actions">
          <el-button v-if="step > 0" :disabled="generating" @click="previousStep">{{
            $t('Previous')
          }}</el-button>
          <el-button :disabled="generating" @click="$emit('close')">{{
            $t(step === 2 ? 'Finish' : 'Cancel')
          }}</el-button>
          <el-button v-if="step < 2" type="primary" :loading="generating" @click="nextStep">{{
            $t(step === 0 ? 'AccessGenerateMaterials' : 'AccessVerifyConnection')
          }}</el-button>
        </div>
      </div>
    </IBox>
  </Page>
</template>

<script>
import IBox from '@/components/Common/IBox'
import Page from '@/layout/components/Page'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import DataTable from '@/components/Table/DataTable'
import { generateApplicationAccessMaterials } from '@/api/applicationCredential'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { copy } from '@/utils/common/index'

export default {
  name: 'ApplicationAccessWizard',
  components: { Page, IBox, Select2, DataTable },
  props: {
    object: { type: Object, required: true }
  },
  emits: ['busy', 'close'],
  data() {
    return {
      step: 0,
      generating: false,
      loading: false,
      verificationFailed: false,
      errors: {},
      materials: {},
      instances: [],
      instancesAmount: 0,
      onlineAmount: 0,
      page: 1,
      instanceColumns: [
        { prop: 'instance_id', label: this.$t('InstanceID'), minWidth: 180 },
        {
          prop: 'remote_addr',
          label: this.$t('ClientAccessIP'),
          minWidth: 150,
          formatter: (row) => row.remote_addr || '-'
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
          minWidth: 170,
          formatter: (row) => (row.date_last_seen ? toSafeLocalDateStr(row.date_last_seen) : '-')
        }
      ],
      form: {
        type: 'sdk',
        app_user: '',
        install_path: '/opt/jumpserver-pam',
        store_scope: 'all',
        store_format: 'json',
        store_accounts: [],
        service_name: 'sample-app',
        allow_account_switch: false,
        update_on_notification: true,
        service_accounts: [
          {
            account_id: '',
            alias: 'database',
            username_field: 'DB_USER',
            secret_field: 'DB_PASSWORD'
          }
        ],
        sdk_language: 'python',
        agent_setup: 'delivery',
        config_file: '',
        config_format: 'auto',
        service_action_type: 'systemd',
        service_script: '',
        application_check: '',
        systemd_unit: '',
        systemd_action: 'restart'
      },
      sdkLanguages: [
        { value: 'python', label: 'Python' },
        { value: 'go', label: 'Go' },
        { value: 'java', label: 'Java' },
        { value: 'node', label: 'Node.js' }
      ]
    }
  },
  computed: {
    instanceTableConfig() {
      return {
        totalData: this.instances,
        columns: this.instanceColumns,
        hasSelection: false,
        hasPagination: false,
        hasOperation: false,
        hasEdit: false,
        hasDelete: false,
        tableAttrs: { border: true, rowKey: 'id' }
      }
    },
    needsSystemd() {
      return this.form.agent_setup !== 'delivery' && this.form.service_action_type === 'systemd'
    },
    documentationRoute() {
      return {
        name: 'IntegrationApplicationList',
        query: {
          tab: 'docs',
          ...(this.form.type === 'sdk' ? { sdk_language: this.form.sdk_language } : {})
        }
      }
    }
  },
  watch: {
    'form.agent_setup'(value) {
      if (value === 'rotation') this.form.allow_account_switch = true
    }
  },
  mounted() {
    this.loadSDKLanguages()
  },
  methods: {
    formatFieldErrors(value) {
      if (Array.isArray(value)) {
        return value
          .map((item) => this.formatFieldErrors(item))
          .filter(Boolean)
          .join(' ')
      }
      if (value && typeof value === 'object') {
        return Object.values(value)
          .map((item) => this.formatFieldErrors(item))
          .filter(Boolean)
          .join(' ')
      }
      return value == null ? '' : String(value)
    },
    addServiceAccount() {
      let suffix = this.form.service_accounts.length + 1
      while (
        this.form.service_accounts.some(
          (account) =>
            account.alias === `account${suffix}` ||
            account.username_field === `ACCOUNT${suffix}_USER` ||
            account.secret_field === `ACCOUNT${suffix}_PASSWORD`
        )
      ) {
        suffix += 1
      }
      this.form.service_accounts.push({
        account_id: '',
        alias: `account${suffix}`,
        username_field: `ACCOUNT${suffix}_USER`,
        secret_field: `ACCOUNT${suffix}_PASSWORD`
      })
    },
    accountOption(account) {
      return {
        label: `${account.username || account.name} (${account.asset?.name || account.asset?.address || account.id})`,
        value: account.id
      }
    },
    copyText: copy,
    async loadSDKLanguages() {
      try {
        const data = await this.$axios.get('/api/v1/accounts/integration-applications/sdks/', {
          params: { language: 'python' },
          disableFlashErrorMsg: true
        })
        if (data.languages?.length) this.sdkLanguages = data.languages
      } catch {
        // Keep the locally listed SDKs available if documentation cannot be loaded.
      }
    },
    previousStep() {
      this.step -= 1
      if (this.step === 0) this.materials = {}
    },
    async nextStep() {
      if (this.step === 0) return this.generate()
      this.step = 2
      await this.loadInstances()
    },
    async generate() {
      if (this.generating) return
      this.errors = {}
      try {
        await this.$refs.form.validate()
      } catch {
        return
      }
      this.generating = true
      this.$emit('busy', true)
      try {
        const payload =
          this.form.type === 'sdk'
            ? {
                type: 'sdk',
                sdk_language: this.form.sdk_language
              }
            : {
                ...this.form,
                service_accounts:
                  this.form.agent_setup === 'delivery' ? undefined : this.form.service_accounts,
                allow_account_switch:
                  this.form.agent_setup === 'rotation' || this.form.allow_account_switch,
                systemd_unit: this.needsSystemd ? this.form.systemd_unit : ''
              }
        this.materials = await generateApplicationAccessMaterials(this.object.id, payload)
        this.step = 1
      } catch (error) {
        const data = error.response?.data
        if (data && typeof data === 'object') {
          for (const [key, value] of Object.entries(data)) {
            this.errors[key === 'non_field_errors' || key === 'detail' ? 'general' : key] =
              this.formatFieldErrors(value)
          }
        }
      } finally {
        this.generating = false
        this.$emit('busy', false)
      }
    },
    downloadConfiguration() {
      const blob = new Blob([this.materials.config], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = this.materials.filename
      link.click()
      URL.revokeObjectURL(url)
    },
    async loadInstances() {
      this.loading = true
      this.verificationFailed = false
      try {
        const data = await this.$axios.get('/api/v1/accounts/credential-client-instances/', {
          params: { application: this.object.id, limit: 10, offset: (this.page - 1) * 10 }
        })
        this.instances = data.results
        this.instancesAmount = data.count
        const app = await this.$axios.get(
          `/api/v1/accounts/integration-applications/${this.object.id}/`
        )
        this.onlineAmount = app.access_readiness.online_instances_amount
      } catch {
        this.verificationFailed = true
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.application-access-wizard {
  min-width: 0;
}
.application-access-wizard :deep(.el-form-item) {
  min-width: 0;
}
.application-access-wizard :deep(.el-select) {
  width: 100%;
}
.context-help,
.field-help {
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}
.field-help {
  margin: 4px 0 0;
  font-size: 12px;
}
.context-help {
  margin: 16px 0;
}
.service-account {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
  margin: 12px 0;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}
.service-account > .el-button {
  grid-column: 1 / -1;
  justify-self: end;
}
@media (max-width: 640px) {
  .service-account {
    grid-template-columns: minmax(0, 1fr);
  }
}
.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin: 16px 0 8px;
}
pre {
  overflow-x: auto;
  padding: 16px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  font-size: 12px;
  line-height: 1.6;
}
.wizard-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
}
.wizard-actions .el-button {
  margin-left: 0;
}
</style>
