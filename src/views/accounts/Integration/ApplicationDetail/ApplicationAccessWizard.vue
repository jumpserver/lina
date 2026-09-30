<template>
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
      <p v-if="form.type === 'sdk'" class="context-help">{{ $t('AccessSDKHelp') }}</p>
      <template v-else>
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
        <el-form-item :label="$t('CredentialDeliveryMode')">
          <el-select v-model="form.delivery_mode">
            <el-option :label="$t('DeliveryJSON')" value="json" />
            <el-option :label="$t('DeliveryEnvironment')" value="environment" />
            <el-option :label="$t('DeliverySocket')" value="socket" />
          </el-select>
        </el-form-item>
        <template v-if="form.delivery_mode === 'environment'">
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
          $t(form.type === 'sdk' ? 'AccessSDKConfigurationHelp' : 'AccessAgentConfigurationHelp')
        }}
      </p>
      <div class="material-header">
        <strong>{{ $t('Install') }}</strong>
        <el-button link type="primary" @click="copyText(materials.install_command)">{{
          $t('Copy')
        }}</el-button>
      </div>
      <pre>{{ materials.install_command }}</pre>
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
      <el-table :data="instances">
        <el-table-column prop="instance_id" :label="$t('InstanceID')" min-width="180" />
        <el-table-column :label="$t('ClientStatus')" width="110">
          <template #default="{ row }">{{
            $t(!row.is_active ? 'Disabled' : row.online ? 'Online' : 'Offline')
          }}</template>
        </el-table-column>
        <el-table-column :label="$t('LastReportedAt')" min-width="170">
          <template #default="{ row }">{{
            row.date_last_seen ? localDate(row.date_last_seen) : '-'
          }}</template>
        </el-table-column>
      </el-table>
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
</template>

<script>
import { generateApplicationAccessMaterials } from '@/api/applicationCredential'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { copy } from '@/utils/common/index'

export default {
  name: 'ApplicationAccessWizard',
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
      form: {
        type: 'sdk',
        app_user: '',
        install_path: '/opt/jumpserver-pam',
        delivery_mode: 'json',
        systemd_unit: '',
        systemd_action: 'restart'
      }
    }
  },
  methods: {
    localDate: toSafeLocalDateStr,
    copyText: copy,
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
        this.materials = await generateApplicationAccessMaterials(this.object.id, {
          ...this.form,
          systemd_unit: this.form.delivery_mode === 'environment' ? this.form.systemd_unit : ''
        })
        this.step = 1
      } catch (error) {
        const data = error.response?.data
        if (data && typeof data === 'object') {
          for (const [key, value] of Object.entries(data)) {
            this.errors[key === 'non_field_errors' || key === 'detail' ? 'general' : key] =
              Array.isArray(value) ? value.join(' ') : String(value)
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
  padding: 24px;
  background: var(--el-bg-color);
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
  gap: 8px;
  margin-top: 24px;
}
.wizard-actions .el-button {
  margin-left: 0;
}
</style>
