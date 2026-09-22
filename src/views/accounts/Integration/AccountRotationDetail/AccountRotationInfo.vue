<template>
  <TwoCol :gutter="20" :left="16" :right="8">
    <el-alert
      v-if="object.precheck && object.precheck.status !== 'passed'"
      :title="precheckMessage"
      :description="object.precheck.code === 'changed' ? object.precheck.detail : ''"
      :type="object.precheck.status === 'checking' ? 'info' : 'error'"
      :closable="false"
      show-icon
      class="detail-block"
    />
    <DetailCard :items="detailItems" :title="$t('BasicInfo')" class="detail-block" />
    <IBox
      v-if="object.mode === 'alternating_rotation'"
      v-loading="rotationStatusLoading && !rotationStatus"
      :title="$t('ApplicationSwitchStatus')"
      class="detail-block switch-status"
    >
      <template v-if="rotationStatus">
        <div class="switch-overview" aria-live="polite">
          <div class="account-route">
            <div class="account-route__node">
              <span>{{ $t('SwitchSourceAccount') }}</span>
              <strong>{{ accountName(rotationStatus.switch_source_account) }}</strong>
            </div>
            <div class="account-route__arrow" aria-hidden="true">
              <Icon icon="fa-solid fa-arrow-right" />
            </div>
            <div class="account-route__node account-route__node--target">
              <span>{{ $t('TargetAccount') }}</span>
              <strong>{{ accountName(rotationStatus.desired_account) }}</strong>
            </div>
          </div>

          <div class="switch-readiness">
            <span>{{ $t('ClientSwitchProgress') }}</span>
            <div class="switch-readiness__value">
              <strong>{{ rotationStatus.summary.switched }}/{{ activeParticipantTotal }}</strong>
              <el-tag :type="rotationStatus.summary.blocking ? 'warning' : 'success'">
                {{
                  rotationStatus.summary.blocking
                    ? $t('BlockingClientCount', { count: rotationStatus.summary.blocking })
                    : $t('AllClientsReady')
                }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="switch-summary">
          <div
            v-for="item in switchSummary"
            :key="item.key"
            :class="`switch-summary__item switch-summary__item--${item.key}`"
          >
            <span class="switch-summary__dot" />
            <span class="switch-summary__label">{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </template>

      <el-alert
        v-for="warning in rotationStatus?.warnings || []"
        :key="warning.configuration.id"
        :title="
          $t('NoActiveInstanceWarning', {
            application: warning.application.name,
            configuration: warning.configuration.name
          })
        "
        type="warning"
        :closable="false"
        show-icon
        class="switch-warning"
      />

      <template v-if="rotationStatus?.rotation_id">
        <section class="switch-section">
          <h4 class="switch-section-title">{{ $t('ApplicationSummary') }}</h4>
          <div class="application-switch-list">
            <div
              v-for="application in rotationStatus.applications"
              :key="application.application.id"
              class="application-switch-row"
            >
              <div class="application-switch-row__name">
                <strong>{{ application.application.name }}</strong>
                <span>{{ applicationStatusLabel(application.status) }}</span>
              </div>
              <div class="application-switch-row__progress">
                <el-progress
                  :percentage="applicationProgress(application)"
                  :show-text="false"
                  :stroke-width="6"
                  :status="application.status === 'all_switched' ? 'success' : undefined"
                />
                <span>{{ application.switched }}/{{ application.total }}</span>
              </div>
              <el-tag effect="plain" :type="applicationStatusType(application.status)">
                {{ applicationStatusLabel(application.status) }}
              </el-tag>
              <span
                :class="[
                  'application-switch-row__blockers',
                  { 'is-blocking': application.blocking }
                ]"
              >
                {{ $t('BlockingClientCount', { count: application.blocking }) }}
              </span>
            </div>
          </div>
        </section>

        <section class="switch-section switch-section--instances">
          <div class="switch-instance-heading">
            <div>
              <h4 class="switch-section-title">{{ $t('ClientInstances') }}</h4>
              <span v-if="isAutoRefreshing" class="auto-refresh-state">
                <span class="auto-refresh-state__dot" />
                {{ $t('AutoRefreshing') }}
              </span>
            </div>
            <el-switch v-model="onlyBlockers" :active-text="$t('OnlyBlockers')" />
          </div>
          <DataTable :config="instanceTableConfig" />
        </section>
      </template>
      <el-empty v-else :description="$t('NoRotationRecords')" />
    </IBox>

    <template #right>
      <QuickActions :actions="quickActions" :title="$t('CurrentAction')" class="detail-block" />

      <IBox
        v-if="object.mode === 'alternating_rotation'"
        :title="$t('RotationProgress')"
        class="detail-block rotation-steps"
      >
        <el-steps :active="rotationStep" direction="vertical" finish-status="success">
          <el-step
            v-for="step in rotationSteps"
            :key="step.title"
            :description="step.description"
            :title="step.title"
          />
        </el-steps>
      </IBox>
    </template>
  </TwoCol>
</template>

<script lang="jsx">
import { IBox, QuickActions } from '@/components'
import Icon from '@/components/Widgets/Icon/index.vue'
import { ActionsFormatter } from '@/components/Table/TableFormatters'
import DetailCard from '@/components/Cards/DetailCard/index.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import DataTable from '@/components/Table/DataTable/index.vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { credentialStatusLabel } from '../components/credentialStatus.js'
import { openTaskPage } from '@/utils/jms'
import {
  advanceApplicationCredentialRotation,
  cancelApplicationCredentialRotation,
  getApplicationCredential,
  executeCredentialChange,
  getCredentialRotationStatus,
  retryCredentialChange,
  setClientInstanceActive
} from '@/api/applicationCredential'

const accountName = (account) => account?.username || account?.name || '-'

export default {
  name: 'ApplicationCredentialInfo',
  components: { DataTable, DetailCard, IBox, Icon, QuickActions, TwoCol },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'updated'],
  data() {
    return {
      actionLoading: false,
      disposed: false,
      onlyBlockers: false,
      precheckTimer: null,
      rotationStatus: null,
      rotationStatusLoading: false,
      rotationStatusTimer: null
    }
  },
  watch: {
    'object.id': {
      immediate: true,
      handler() {
        this.schedulePrecheckRefresh()
        this.loadRotationStatus()
      }
    },
    'object.precheck.status': {
      immediate: true,
      handler() {
        this.schedulePrecheckRefresh()
      }
    },
    'object.status': {
      immediate: true,
      handler() {
        this.scheduleRotationStatusRefresh()
      }
    }
  },
  beforeUnmount() {
    this.disposed = true
    clearTimeout(this.precheckTimer)
    clearTimeout(this.rotationStatusTimer)
  },
  computed: {
    activeParticipantTotal() {
      const summary = this.rotationStatus?.summary || {}
      return Math.max((summary.total || 0) - (summary.excluded || 0), 0)
    },
    isAutoRefreshing() {
      return ['waiting_switch', 'ready_for_change', 'waiting_revert'].includes(this.object.status)
    },
    precheckMessage() {
      const precheck = this.object.precheck
      if (precheck?.status === 'checking') return this.$t('PamPrecheckRunning')
      const keys = {
        timeout: 'PamPrecheckTimeout',
        changed: 'PamPrecheckChanged',
        dispatch_failed: 'PamPrecheckDispatchFailed',
        failed: 'PamPrecheckFailed'
      }
      return this.$t(keys[precheck?.code] || 'PamPrecheckFailed')
    },
    rotationStep() {
      if (this.object.status === 'idle') {
        return this.object.date_last_rotated ? this.rotationSteps.length : 0
      }
      const steps = {
        waiting_switch: 0,
        ready_for_change: 1,
        changing_secret: 2,
        change_failed: 2,
        recovery_required: 2,
        waiting_revert: 3
      }
      return steps[this.object.status] || 0
    },
    switchSummary() {
      const summary = this.rotationStatus?.summary || {}
      return [
        {
          key: 'source',
          label: this.$t('UsingAccount', {
            account: accountName(this.rotationStatus?.switch_source_account)
          }),
          value: summary.using_source || 0
        },
        {
          key: 'target',
          label: this.$t('SwitchedToAccount', {
            account: accountName(this.rotationStatus?.desired_account)
          }),
          value: summary.switched || 0
        },
        {
          key: 'waiting',
          label: this.$t('AwaitingConfirmation'),
          value: (summary.awaiting_confirmation || 0) + (summary.stale_confirmation || 0)
        },
        { key: 'offline', label: this.$t('Offline'), value: summary.offline || 0 },
        { key: 'unknown', label: this.$t('StatusUnknown'), value: summary.unknown || 0 }
      ]
    },
    visibleInstances() {
      const instances = this.rotationStatus?.instances || []
      return this.onlyBlockers ? instances.filter((item) => item.blocking) : instances
    },
    instanceTableConfig() {
      return {
        url: '',
        totalData: this.visibleInstances,
        hasPagination: false,
        hasSelection: false,
        columns: [
          {
            prop: 'client.instance_id',
            label: this.$t('InstanceID'),
            minWidth: 210,
            formatter: (row) => (
              <div class="instance-identity">
                <strong>{row.client.instance_id}</strong>
                <span>
                  {row.application.name} · {row.configuration.name}
                </span>
              </div>
            )
          },
          {
            prop: 'applied_account',
            label: this.$t('AccountUsage'),
            minWidth: 170,
            formatter: (row) => (
              <div class="account-usage">
                <strong>{accountName(row.applied_account)}</strong>
                <span>
                  {this.$t('TargetAccount')}: {accountName(row.desired_account)}
                </span>
              </div>
            )
          },
          {
            prop: 'revision',
            label: this.$t('Version'),
            width: 100,
            formatter: (row) => `${row.applied_revision || 0}/${row.required_revision || 0}`
          },
          {
            prop: 'status',
            label: this.$t('Status'),
            width: 130,
            formatter: (row) => (
              <el-tag effect="plain" type={this.instanceStatusType(row.status)}>
                {this.instanceStatusLabel(row.status)}
              </el-tag>
            )
          },
          {
            prop: 'date_applied',
            label: this.$t('LastConfirmedAt'),
            width: 165,
            formatter: (row) => this.formatDate(row.date_applied)
          },
          {
            prop: 'actions',
            label: this.$t('Actions'),
            width: 76,
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'disable',
                  title: this.$t('Disable'),
                  type: 'danger',
                  can: () =>
                    this.$hasPerm('accounts.change_credentialclientinstance') &&
                    !this.actionLoading,
                  has: ({ row }) => row.status !== 'excluded',
                  callback: ({ row }) => this.disableClient(row)
                }
              ]
            }
          }
        ]
      }
    },
    modeLabel() {
      return this.$t(
        this.object.mode === 'alternating_rotation'
          ? 'AlternatingAccountRotation'
          : 'CredentialUpdateSubscription'
      )
    },
    detailItems() {
      const items = [
        { key: this.$t('Name'), value: this.object.name },
        { key: this.$t('CredentialKey'), value: this.object.key },
        { key: this.$t('CredentialPolicyMode'), value: this.modeLabel },
        {
          key: this.$t('Status'),
          value: credentialStatusLabel(this.object, this.$t),
          formatter: (_item, value) => (
            <el-tag
              type={
                !this.object.is_active
                  ? 'info'
                  : this.object.status === 'idle'
                    ? 'success'
                    : 'warning'
              }
            >
              {value}
            </el-tag>
          )
        }
      ]
      if (this.object.mode === 'alternating_rotation') {
        const asset = this.object.asset || {}
        const nextAccount =
          this.object.active_account?.id === this.object.account?.id
            ? this.object.alternate_account
            : this.object.account
        items.push(
          {
            key: this.$t('Asset'),
            value: asset.name ? `${asset.name} (${asset.address})` : '-'
          },
          { key: this.$t('AssetType'), value: asset.platform?.name || '-' },
          { key: this.$t('CurrentAccount'), value: accountName(this.object.active_account) },
          { key: this.$t('NextAccount'), value: accountName(nextAccount) }
        )
      } else {
        items.push({
          key: this.$t('SubscriptionScope'),
          value: this.object.applications?.map((application) => application.name).join(', ') || '-'
        })
      }
      items.push(
        { key: this.$t('LastFetched'), value: this.formatDate(this.object.last_fetched) },
        { key: this.$t('LastRotation'), value: this.formatDate(this.object.date_last_rotated) },
        { key: this.$t('Comment'), value: this.object.comment || '-' }
      )
      if (this.object.change_execution) {
        items.push({
          key: this.$t('ChangeSecretExecution'),
          value: this.object.change_execution.id
        })
      }
      if (this.object.rotation) {
        const rotation = this.object.rotation
        const outcomes = {
          running: 'Running',
          success: 'Success',
          unchanged: 'PamChangeFailed',
          unverified: 'PamRecoveryRequired'
        }
        items.push(
          {
            key: this.$t('PamExecutionStatus'),
            value: this.$t(outcomes[rotation.outcome] || 'ReadyForSecretChange')
          },
          { key: this.$t('DateStart'), value: this.formatDate(rotation.date_start) },
          { key: this.$t('Error'), value: rotation.error || '-' }
        )
      }
      return items
    },
    rotationSteps() {
      return [
        {
          title: this.$t('SwitchToAlternateAccount'),
          description: this.$t('WaitingForClientReport')
        },
        {
          title: this.$t('ConfirmApplicationsSwitched'),
          description: this.$t('SecretChangeGuard')
        },
        {
          title: this.$t('ChangeAndVerifySecret'),
          description: this.$t('ChangeInactiveAccountSecretHelp')
        },
        {
          title: this.$t('RotationCompleted'),
          description: this.$t('AllClientsConfirmed')
        }
      ]
    },
    rotationActionLabel() {
      let label
      if (this.object.status === 'idle') {
        label = this.$t(
          this.object.precheck?.status === 'checking' ? 'PamPrecheckRunning' : 'StartRotation'
        )
      } else if (this.object.status === 'ready_for_change') {
        label = this.$t(this.object.rotation?.automation_id ? 'Execute' : 'ChangeSecret')
      } else if (
        ['changing_secret', 'change_failed', 'recovery_required'].includes(this.object.status)
      ) {
        label = this.$t('CheckSecretChangeResult')
      } else {
        label = this.$t('ContinueRotation')
      }
      const blockers = this.rotationStatus?.summary?.blocking || 0
      return blockers ? `${label} (${blockers})` : label
    },
    quickActions() {
      return [
        {
          title: this.$t('ChangeSecret'),
          has:
            !!this.object.rotation?.automation_id &&
            ['ready_for_change', 'change_failed'].includes(this.object.status) &&
            this.$hasPerm('accounts.change_changesecretautomation'),
          attrs: { label: this.$t('Edit'), disabled: this.actionLoading },
          callbacks: {
            click: () =>
              this.$router.push({
                name: 'AccountChangeSecretUpdate',
                params: { id: this.object.rotation.automation_id }
              })
          }
        },
        {
          title: this.$t('Configuration'),
          has: this.$hasPerm('accounts.change_applicationcredential'),
          attrs: { label: this.$t('Edit'), disabled: this.object.status !== 'idle' },
          callbacks: { click: () => this.$emit('edit', this.object) }
        },
        {
          title: this.$t('AccountRotation'),
          has:
            this.object.mode === 'alternating_rotation' &&
            this.$hasPerm('accounts.change_applicationcredential'),
          attrs: {
            type: 'primary',
            label: this.rotationActionLabel,
            loading: this.actionLoading,
            disabled:
              !this.object.is_active ||
              this.object.precheck?.status === 'checking' ||
              (this.object.status === 'idle' && !this.$hasPerm('accounts.verify_account')) ||
              (this.object.status === 'ready_for_change' &&
                !this.$hasPerm(
                  this.object.rotation?.automation_id
                    ? 'accounts.add_changesecretexecution'
                    : 'accounts.add_changesecretautomation'
                ))
          },
          callbacks: { click: this.advanceRotation }
        },
        {
          title: this.$t('ExecutionLog'),
          has:
            this.object.mode === 'alternating_rotation' &&
            !!this.object.rotation?.execution_id &&
            this.$hasPerm('accounts.view_changesecretexecution'),
          attrs: {
            label: this.$t('View')
          },
          callbacks: { click: () => openTaskPage(this.object.rotation.execution_id) }
        },
        {
          title: this.$t('PamChangeSecretResult'),
          has:
            this.object.mode === 'alternating_rotation' &&
            !!this.object.rotation?.execution_id &&
            this.$hasPerm('accounts.view_changesecretrecord'),
          attrs: { label: this.$t('View') },
          callbacks: {
            click: () =>
              this.$router.push({
                name: 'AccountChangeSecretList',
                query: {
                  tab: 'ChangeSecretRecord',
                  execution_id: this.object.rotation.execution_id
                }
              })
          }
        },
        {
          title: this.$t('ChangeSecret'),
          has:
            this.object.rotation?.execution_status === 'pending' &&
            this.$hasPerm('accounts.add_changesecretexecution') &&
            this.$hasPerm('accounts.change_applicationcredential'),
          attrs: { label: this.$t('PamRedispatch'), disabled: this.actionLoading },
          callbacks: { click: this.executeSavedTask }
        },
        {
          title: this.$t('Retry'),
          has:
            this.object.status === 'change_failed' &&
            this.$hasPerm('accounts.add_changesecretexecution') &&
            this.$hasPerm('accounts.change_applicationcredential'),
          attrs: { label: this.$t('Retry'), disabled: this.actionLoading },
          callbacks: { click: this.retryChange }
        },
        {
          title: this.$t('Cancel'),
          has:
            this.object.mode === 'alternating_rotation' &&
            ['waiting_switch', 'ready_for_change', 'change_failed'].includes(this.object.status) &&
            this.$hasPerm('accounts.change_applicationcredential'),
          attrs: { label: this.$t('CancelRotation'), disabled: this.actionLoading },
          callbacks: { click: this.cancelRotation }
        },
        {
          title: this.$t('Status'),
          attrs: { label: this.$t('Refresh'), disabled: this.actionLoading },
          callbacks: { click: this.refresh }
        },
        {
          title: this.$t('PamPrecheck'),
          has: !!this.object.precheck?.execution_id && this.$hasPerm('accounts.verify_account'),
          attrs: { label: this.$t('View') },
          callbacks: { click: () => openTaskPage(this.object.precheck.execution_id) }
        }
      ]
    }
  },
  methods: {
    accountName,
    applicationProgress(application) {
      if (!application.total) return 0
      return Math.round((application.switched / application.total) * 100)
    },
    applicationStatusLabel(status) {
      return this.$t(
        {
          all_switched: 'FullySwitched',
          partially_switched: 'PartiallySwitched',
          not_switched: 'NotSwitched',
          no_instance: 'NoActiveInstances'
        }[status] || 'StatusUnknown'
      )
    },
    applicationStatusType(status) {
      return {
        all_switched: 'success',
        partially_switched: 'warning',
        not_switched: 'warning',
        no_instance: 'info'
      }[status]
    },
    instanceStatusLabel(status) {
      return this.$t(
        {
          switched: 'Switched',
          using_source: 'UsingSourceAccount',
          awaiting_confirmation: 'AwaitingConfirmation',
          stale_confirmation: 'StaleConfirmation',
          offline: 'Offline',
          unknown: 'StatusUnknown',
          excluded: 'Excluded'
        }[status] || 'StatusUnknown'
      )
    },
    instanceStatusType(status) {
      return {
        switched: 'success',
        excluded: 'info',
        using_source: 'warning',
        awaiting_confirmation: 'warning',
        stale_confirmation: 'warning',
        offline: 'danger',
        unknown: 'danger'
      }[status]
    },
    async loadRotationStatus() {
      clearTimeout(this.rotationStatusTimer)
      if (this.object.mode !== 'alternating_rotation' || !this.object.id) {
        this.rotationStatus = null
        return
      }
      this.rotationStatusLoading = true
      try {
        this.rotationStatus = await getCredentialRotationStatus(this.object.id)
      } finally {
        this.rotationStatusLoading = false
        this.scheduleRotationStatusRefresh()
      }
    },
    scheduleRotationStatusRefresh() {
      clearTimeout(this.rotationStatusTimer)
      if (
        this.disposed ||
        !['waiting_switch', 'ready_for_change', 'waiting_revert'].includes(this.object.status)
      ) {
        return
      }
      this.rotationStatusTimer = setTimeout(() => this.loadRotationStatus(), 5000)
    },
    schedulePrecheckRefresh() {
      clearTimeout(this.precheckTimer)
      if (this.disposed || this.object.precheck?.status !== 'checking') return
      this.precheckTimer = setTimeout(async () => {
        try {
          const id = this.object.id
          const updated = await getApplicationCredential(id)
          if (this.disposed || this.object.id !== id) return
          this.$emit('updated', updated)
          await this.$nextTick()
          this.schedulePrecheckRefresh()
        } catch (_) {
          // The shared request handler displays the error; manual refresh remains available.
        }
      }, 3000)
    },
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '-'
    },
    async advanceRotation() {
      const createTask = this.object.status === 'ready_for_change'
      if (createTask) {
        if (this.object.rotation?.automation_id) return this.executeSavedTask()
        return this.openChangeSecretForm()
      }
      const previousStatus = this.object.status
      if (previousStatus === 'idle') {
        try {
          await this.$confirm(this.$t('StartCredentialRotationConfirm'), this.$t('Warning'), {
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
          })
        } catch {
          return
        }
      }
      this.actionLoading = true
      try {
        const updated = await advanceApplicationCredentialRotation(this.object)
        this.$emit('updated', updated)
        await this.loadRotationStatus()
        if (updated.status !== previousStatus) {
          this.$message.success(
            updated.status === 'idle' ? this.$t('RotationCompleted') : this.$t('StepCompleted')
          )
        } else if (previousStatus === 'changing_secret') {
          this.$message.info(this.$t('PamChangeStillRunning'))
        } else if (previousStatus === 'change_failed') {
          this.$message.warning(this.$t('PamChangeReadyForRetry'))
        } else if (previousStatus === 'recovery_required') {
          this.$message.warning(this.$t('PamRecoveryStillRequired'))
        }
      } catch (error) {
        if (error.response?.data?.rotation_status) {
          this.rotationStatus = error.response.data.rotation_status
        } else if (error.response?.data?.blockers) {
          await this.loadRotationStatus()
        }
      } finally {
        this.actionLoading = false
      }
    },
    openChangeSecretForm() {
      if (!this.$hasPerm('accounts.add_changesecretautomation')) return
      return this.$router.push({
        name: 'AccountChangeSecretCreate',
        query: {
          application_credential: this.object.id,
          credential_rotation: this.object.rotation?.id
        }
      })
    },
    async executeSavedTask() {
      try {
        await this.$confirm(this.$t('ExecuteCredentialChangeConfirm'), this.$t('Warning'), {
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        })
      } catch {
        return
      }
      this.actionLoading = true
      try {
        await executeCredentialChange(this.object.rotation.automation_id)
        await this.refresh()
      } finally {
        this.actionLoading = false
      }
    },
    async retryChange() {
      const { value } = await this.$prompt(this.$t('PamChangeReason'), this.$t('Retry'), {
        inputValidator: (value) => !!value?.trim(),
        inputErrorMessage: this.$t('PamChangeReason')
      })
      this.actionLoading = true
      try {
        await retryCredentialChange(this.object.id, this.object.rotation.execution_id, value.trim())
        await this.refresh()
      } finally {
        this.actionLoading = false
      }
    },
    async cancelRotation() {
      let reason = ''
      if (this.object.status === 'change_failed') {
        const { value } = await this.$prompt(
          this.$t('PamChangeReason'),
          this.$t('CancelRotation'),
          {
            inputValidator: (value) => !!value?.trim(),
            inputErrorMessage: this.$t('PamChangeReason')
          }
        )
        reason = value.trim()
      } else {
        try {
          await this.$confirm(this.$t('CancelCredentialRotationConfirm'), this.$t('Warning'), {
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
          })
        } catch {
          return
        }
      }
      this.actionLoading = true
      try {
        const updated = await cancelApplicationCredentialRotation(this.object.id, reason)
        this.$emit('updated', updated)
        await this.loadRotationStatus()
        this.$message.success(this.$t('UpdateSuccessMsg'))
      } finally {
        this.actionLoading = false
      }
    },
    async refresh() {
      const [credential] = await Promise.all([
        getApplicationCredential(this.object.id),
        this.loadRotationStatus()
      ])
      this.$emit('updated', credential)
    },
    async disableClient(row) {
      const { value } = await this.$prompt(
        this.$t('ExcludeRotatingClientReasonHelp'),
        this.$t('Disable'),
        {
          inputValidator: (value) => !!value?.trim(),
          inputErrorMessage: this.$t('ExclusionReasonRequired')
        }
      )
      await setClientInstanceActive(row.client.id, false, value.trim())
      await this.refresh()
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-block {
  margin-bottom: 15px;
}

.switch-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 20px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.account-route {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 14px;
}

.account-route__node {
  display: grid;
  min-width: 140px;
  gap: 4px;

  span {
    color: var(--color-help-text);
    font-size: 12px;
  }

  strong {
    overflow: hidden;
    color: var(--color-text-primary);
    font-size: 16px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.account-route__node--target strong {
  color: var(--color-primary);
}

.account-route__arrow {
  color: var(--color-help-text);
}

.switch-readiness {
  flex: none;
  min-width: 220px;
  padding-left: 24px;
  border-left: 1px solid var(--color-border);
  color: var(--color-help-text);
  font-size: 12px;
}

.switch-readiness__value {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;

  strong {
    color: var(--color-text-primary);
    font-size: 22px;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
}

.switch-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
  padding: 14px 4px;
  border-bottom: 1px solid var(--color-border);
}

.switch-summary__item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-help-text);
  font-size: 13px;

  strong {
    color: var(--color-text-primary);
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
}

.switch-summary__dot {
  width: 7px;
  height: 7px;
  background: var(--color-info);
  border-radius: 50%;
}

.switch-summary__item--source .switch-summary__dot,
.switch-summary__item--waiting .switch-summary__dot {
  background: var(--color-warning);
}

.switch-summary__item--target .switch-summary__dot {
  background: var(--color-primary);
}

.switch-summary__item--offline .switch-summary__dot {
  background: var(--color-danger);
}

.switch-summary__item--unknown .switch-summary__dot {
  background: var(--color-help-text);
}

.switch-warning {
  margin-top: 14px;
}

.switch-section {
  margin-top: 20px;
}

.switch-section-title {
  margin: 0 0 10px;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 600;
}

.application-switch-list {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.application-switch-row {
  display: grid;
  grid-template-columns: minmax(160px, 1.4fr) minmax(160px, 1fr) auto minmax(90px, auto);
  align-items: center;
  gap: 20px;
  padding: 14px 16px;
}

.application-switch-row + .application-switch-row {
  border-top: 1px solid var(--color-border);
}

.application-switch-row__name {
  display: grid;
  min-width: 0;
  gap: 3px;

  strong {
    overflow: hidden;
    color: var(--color-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: var(--color-help-text);
    font-size: 12px;
  }
}

.application-switch-row__progress {
  display: grid;
  grid-template-columns: minmax(100px, 1fr) auto;
  align-items: center;
  gap: 10px;
  color: var(--color-help-text);
  font-variant-numeric: tabular-nums;
}

.application-switch-row__blockers {
  color: var(--color-help-text);
  text-align: right;
  white-space: nowrap;

  &.is-blocking {
    color: var(--color-warning);
    font-weight: 600;
  }
}

.switch-instance-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  > div {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.auto-refresh-state {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-help-text);
  font-size: 12px;
}

.auto-refresh-state__dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: switch-status-pulse 2s ease-in-out infinite;
}

:deep(.instance-identity),
:deep(.account-usage) {
  display: grid;
  min-width: 0;
  gap: 3px;

  strong {
    overflow: hidden;
    color: var(--color-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    overflow: hidden;
    color: var(--color-help-text);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@keyframes switch-status-pulse {
  50% {
    opacity: 0.35;
  }
}

@media (max-width: 1200px) {
  .switch-overview {
    align-items: stretch;
    flex-direction: column;
  }

  .switch-readiness {
    min-width: 0;
    padding-top: 14px;
    padding-left: 0;
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }

  .application-switch-row {
    grid-template-columns: minmax(150px, 1fr) minmax(140px, 1fr) auto;
  }

  .application-switch-row__blockers {
    grid-column: 1 / -1;
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auto-refresh-state__dot {
    animation: none;
  }
}

.rotation-steps :deep(.el-step__main) {
  min-width: 0;
  padding-bottom: 18px;
}

.rotation-steps :deep(.el-step__title) {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
}

.rotation-steps :deep(.el-step__description) {
  padding-right: 0;
  color: var(--color-help-text);
  line-height: 20px;
}
</style>
