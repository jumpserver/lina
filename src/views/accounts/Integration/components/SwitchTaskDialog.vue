<template>
  <el-dialog
    :close-on-click-modal="false"
    :model-value="visible"
    :title="$t('CreateSwitchTask')"
    append-to-body
    width="760px"
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-steps :active="step" finish-status="success" simple>
      <el-step :title="$t('SelectAccounts')" />
      <el-step :title="$t('ConfirmImpact')" />
      <el-step :title="$t('SubmitTask')" />
    </el-steps>

    <div v-loading="loading" class="task-body">
      <template v-if="step === 0">
        <el-alert
          :closable="false"
          :title="$t('SwitchTaskDoesNotChangePassword')"
          show-icon
          type="warning"
        />
        <el-form label-width="120px" class="task-form">
          <el-form-item :label="$t('SourceAccount')" required>
            <el-select
              v-model="form.source_account"
              filterable
              style="width: 100%"
              @change="sourceChanged"
            >
              <el-option
                v-for="account in sourceAccounts"
                :key="account.id"
                :label="accountLabel(account)"
                :value="account.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('TargetAccount')" required>
            <el-select v-model="form.target_account" filterable style="width: 100%">
              <el-option
                v-for="account in targetAccounts"
                :key="account.id"
                :label="accountLabel(account)"
                :value="account.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('Comment')">
            <el-input v-model="form.comment" :rows="3" type="textarea" />
          </el-form-item>
        </el-form>
      </template>

      <template v-else-if="step === 1">
        <el-alert
          :closable="false"
          :title="$t('AffectedBindingsSummary', { count: affectedBindings.length })"
          show-icon
          type="info"
        />
        <el-table :data="affectedBindings" border class="impact-table">
          <el-table-column :label="$t('Application')" min-width="180">
            <template #default="{ row }">{{ row.application?.name || '-' }}</template>
          </el-table-column>
          <el-table-column :label="$t('CredentialBindingID')" min-width="330">
            <template #default="{ row }">
              <span class="binding-id">
                <code>{{ row.credential_id }}</code>
                <el-button link type="primary" @click="copy(row.credential_id)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </span>
            </template>
          </el-table-column>
        </el-table>
        <p class="impact-note">{{ $t('TargetAccountSameAssetRequired') }}</p>
      </template>

      <el-result
        v-else
        :sub-title="$t('SwitchTaskCreatedHint')"
        :title="$t('SwitchTaskCreated')"
        icon="success"
      />
    </div>

    <template #footer>
      <el-button v-if="step < 2" @click="$emit('update:visible', false)">
        {{ $t('Cancel') }}
      </el-button>
      <el-button v-if="step === 1" @click="step = 0">{{ $t('Previous') }}</el-button>
      <el-button v-if="step === 0" :disabled="!canContinue" type="primary" @click="step = 1">
        {{ $t('Next') }}
      </el-button>
      <el-button v-if="step === 1" :loading="submitting" type="primary" @click="submit">
        {{ $t('SubmitTask') }}
      </el-button>
      <el-button v-if="step === 2" type="primary" @click="done">{{ $t('Done') }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { copy } from '@/utils/common/index'

export default {
  name: 'SwitchTaskDialog',
  props: { visible: { type: Boolean, default: false } },
  emits: ['update:visible', 'created'],
  data() {
    return {
      form: { source_account: '', target_account: '', comment: '' },
      loading: false,
      credentials: [],
      step: 0,
      submitting: false,
      targetAccounts: []
    }
  },
  computed: {
    sourceAccounts() {
      return this.credentials.map((item) => ({
        ...item.account,
        asset: item.asset,
        bindings: item.bindings
      }))
    },
    affectedBindings() {
      const credential = this.credentials.find(
        (item) => item.account.id === this.form.source_account
      )
      return credential?.bindings || []
    },
    canContinue() {
      return (
        this.form.source_account && this.form.target_account && this.affectedBindings.length > 0
      )
    }
  },
  watch: {
    visible(value) {
      if (value) this.open()
    }
  },
  methods: {
    copy,
    accountLabel(account) {
      if (!account) return '-'
      const asset = account.asset
      return `${account.name} (${account.username})${
        asset ? ` - ${asset.name} (${asset.address})` : ''
      }`
    },
    async open() {
      this.form = { source_account: '', target_account: '', comment: '' }
      this.targetAccounts = []
      this.step = 0
      this.loading = true
      try {
        const result = await this.$axios.get(
          '/api/v1/accounts/application-account-switches/credentials/'
        )
        this.credentials = result.results || result
      } finally {
        this.loading = false
      }
    },
    async sourceChanged(accountId) {
      this.form.target_account = ''
      const source = this.sourceAccounts.find((item) => item.id === accountId)
      if (!source?.asset?.id) return
      this.loading = true
      try {
        const result = await this.$axios.get('/api/v1/accounts/accounts/', {
          params: { asset: source.asset.id, is_active: true, limit: 1000 }
        })
        const applicationIds = new Set(
          (source.bindings || []).map((binding) => binding.application.id)
        )
        const unavailableAccountIds = new Set(
          this.credentials
            .filter((credential) =>
              credential.bindings.some((binding) => applicationIds.has(binding.application.id))
            )
            .map((credential) => credential.account.id)
        )
        this.targetAccounts = (result.results || result).filter(
          (item) => !unavailableAccountIds.has(item.id)
        )
      } finally {
        this.loading = false
      }
    },
    async submit() {
      this.submitting = true
      try {
        const result = await this.$axios.post(
          '/api/v1/accounts/application-account-switches/',
          this.form
        )
        this.step = 2
        this.$emit('created', result)
      } finally {
        this.submitting = false
      }
    },
    done() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.task-body {
  min-height: 360px;
  padding-top: 16px;
  max-height: 62vh;
  overflow-y: auto;
}

.task-form {
  margin-top: 20px;
}

.impact-table {
  margin-top: 16px;
}

.impact-note {
  color: var(--el-text-color-secondary);
  margin: 12px 0 0;
}

.binding-id {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
