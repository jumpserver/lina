<template>
  <Drawer
    :close-on-click-modal="false"
    :title="$t('CreateSwitchTask')"
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
  >
    <div v-loading="loading" class="switch-task-page">
      <IBox>
        <section class="form-section">
          <h3 class="section-title">{{ $t('SelectAccounts') }}</h3>
          <el-form label-width="18.2%" class="task-form">
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
              <div class="field-control">
                <el-select v-model="form.target_account" filterable style="width: 100%">
                  <el-option
                    v-for="account in targetAccounts"
                    :key="account.id"
                    :label="accountLabel(account)"
                    :value="account.id"
                  />
                </el-select>
                <div class="field-help">{{ $t('TargetAccountSameAssetRequired') }}</div>
              </div>
            </el-form-item>
            <el-form-item :label="$t('Comment')">
              <el-input v-model="form.comment" :rows="4" type="textarea" />
            </el-form-item>
            <el-form-item :label="$t('ConfirmImpact')">
              <div class="impact-field">
                <div class="section-summary">
                  {{ $t('AffectedBindingsSummary', { count: affectedBindings.length }) }}
                </div>
                <div v-if="form.source_account" class="el-data-table impact-table">
                  <el-table :data="affectedBindings" class="el-table--fit el-table--border">
                    <el-table-column
                      show-overflow-tooltip
                      :label="$t('RelevantApp')"
                      min-width="180"
                    >
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
                </div>
              </div>
            </el-form-item>

            <div class="form-buttons task-actions">
              <el-button
                :disabled="!canContinue"
                :loading="submitting"
                class="form-submit-button"
                size="default"
                type="primary"
                @click="submit"
              >
                {{ $t('SubmitTask') }}
              </el-button>
              <el-button class="form-secondary-button" @click="$emit('update:visible', false)">
                {{ $t('Cancel') }}
              </el-button>
            </div>
          </el-form>
        </section>
      </IBox>
    </div>
  </Drawer>
</template>

<script>
import IBox from '@/components/Common/IBox'
import Drawer from '@/components/Drawer'
import { copy } from '@/utils/common/index'

export default {
  name: 'SwitchTaskDialog',
  components: { Drawer, IBox },
  props: { visible: { type: Boolean, default: false } },
  emits: ['update:visible', 'created'],
  data() {
    return {
      form: { source_account: '', target_account: '', comment: '' },
      loading: false,
      credentials: [],
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
        this.$emit('created', result)
        this.$message.success(this.$t('SwitchTaskCreated'))
        this.$emit('update:visible', false)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.switch-task-page {
  padding: 12px 12px 30px;
  box-sizing: border-box;
}

.section-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}

.section-summary {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.task-form {
  margin-top: 20px;
}

.field-control {
  width: 100%;
}

.field-help {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.task-actions {
  display: flex;
  gap: 10px;
  padding-left: calc(18.2% + 12px);
  margin-top: 10px;
}

.impact-field {
  width: 100%;
}

.impact-table {
  margin-top: 8px;
}

.binding-id {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.el-data-table :deep(.el-table) {
  .el-table__row > td {
    padding: 6px 0;
    border-right: none;
    font-size: 13px;
    line-height: 1.5;

    * {
      vertical-align: middle;
    }
  }

  .el-table__header > thead > tr > th {
    padding: 6px 0;
    border-right: none;
    background-color: #fff;
    font-size: 13px;
    line-height: 1.5;

    .cell {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap !important;
    }
  }
}
</style>
