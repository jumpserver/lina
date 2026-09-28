<template>
  <section class="credential-info" :aria-label="$t('BasicInfo')">
    <el-alert
      v-if="object.precheck && object.precheck.status !== 'passed'"
      :title="precheckMessage"
      :description="object.precheck.code === 'changed' ? object.precheck.detail : ''"
      :type="object.precheck.status === 'checking' ? 'info' : 'error'"
      :closable="false"
      show-icon
    />
    <TwoCol :gutter="20" :left="16" :right="8">
      <DetailCard :items="detailItems" :title="$t('BasicInfo')" />
      <template #right>
        <QuickActions :actions="quickActions" :title="$t('CurrentAction')" />
      </template>
    </TwoCol>
  </section>
</template>

<script lang="jsx">
import { QuickActions } from '@/components'
import DetailCard from '@/components/Cards/DetailCard/index.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { credentialStatusLabel } from '../components/credentialStatus.js'
import { subscribedAccountLabel } from '../components/subscriptionAccount.js'
import { openTaskPage } from '@/utils/jms'
import {
  advanceApplicationCredentialRotation,
  cancelApplicationCredentialRotation,
  getApplicationCredential,
  executeCredentialChange,
  getCredentialRotationStatus,
  retryCredentialChange
} from '@/api/applicationCredential'

const accountName = (account) => account?.username || account?.name || '-'

export default {
  name: 'ApplicationCredentialInfo',
  components: { DetailCard, QuickActions, TwoCol },
  props: {
    object: {
      type: Object,
      required: true
    },
    cycleStarting: Boolean
  },
  emits: ['edit', 'updated', 'start-cycle'],
  data() {
    return {
      actionLoading: false,
      disposed: false,
      precheckTimer: null,
      rotationStatus: null,
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
        this.schedulePrecheckRefresh()
      }
    }
  },
  beforeUnmount() {
    this.disposed = true
    clearTimeout(this.precheckTimer)
    clearTimeout(this.rotationStatusTimer)
  },
  computed: {
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
          { key: this.$t('NextAccount'), value: accountName(nextAccount) },
          {
            key: this.$t('StandbyNoTrafficDays'),
            value: this.$t('StandbyNoTrafficDaysValue', {
              days: this.object.standby_no_traffic_days ?? 7
            })
          }
        )
      } else {
        items.push(
          {
            key: this.$t('SubscribedAccounts'),
            value: this.object.subscription_all_authorized
              ? this.$t('LegacyAllAuthorizedAccounts')
              : this.object.subscription_accounts?.map(subscribedAccountLabel).join(', ') || '-'
          },
          {
            key: this.$t('SubscriptionScope'),
            value:
              this.object.applications?.map((application) => application.name).join(', ') || '-'
          }
        )
      }
      items.push(
        { key: this.$t('LastFetched'), value: this.formatDate(this.object.last_fetched) },
        { key: this.$t('LastRotation'), value: this.formatDate(this.object.date_last_rotated) },
        { key: this.$t('Comment'), value: this.object.comment || '-' }
      )
      if (this.object.preparation) {
        const preparation = this.object.preparation
        items.push(
          {
            key: this.$t('RotationAlignment'),
            value: preparation.applications
              .map(
                (app) =>
                  `${app.name}: ${this.$t(app.aligned ? 'RotationAligned' : 'RotationNotAligned')}`
              )
              .join(', ')
          },
          {
            key: this.$t('StandbyLastSecretAccess'),
            value: this.formatDate(preparation.standby_last_access)
          },
          {
            key: this.$t('StandbyIdleSince'),
            value: this.formatDate(preparation.standby_idle_since)
          },
          { key: this.$t('RotationEligibleAt'), value: this.formatDate(preparation.eligible_at) }
        )
      }
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
    rotationActionLabel() {
      let label
      if (this.object.status === 'idle') {
        label = this.$t('StartNewPolicyCycle')
      } else if (['preparing', 'waiting_standby'].includes(this.object.status)) {
        label = this.$t('CheckRotationPreparation')
      } else if (this.object.status === 'ready_to_switch') {
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
      const blockers = this.object.preparation
        ? this.object.preparation.applications.filter((app) => !app.aligned).length
        : this.rotationStatus?.summary?.blocking || 0
      return blockers ? `${label} (${blockers})` : label
    },
    rotationAction() {
      return {
        title: this.$t('AccountRotation'),
        has:
          this.object.mode === 'alternating_rotation' &&
          this.$hasPerm('accounts.change_applicationcredential'),
        attrs: {
          type: 'primary',
          label: this.rotationActionLabel,
          loading: this.actionLoading || this.cycleStarting,
          disabled:
            this.cycleStarting ||
            !this.object.is_active ||
            this.object.precheck?.status === 'checking' ||
            (this.object.status === 'ready_to_switch' &&
              !this.$hasPerm('accounts.verify_account')) ||
            (this.object.status === 'ready_for_change' &&
              !this.$hasPerm(
                this.object.rotation?.automation_id
                  ? 'accounts.add_changesecretexecution'
                  : 'accounts.add_changesecretautomation'
              ))
        },
        callbacks: { click: this.advanceRotation }
      }
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
          attrs: {
            label: this.$t('Edit'),
            disabled: this.object.status !== 'idle' || this.cycleStarting
          },
          callbacks: { click: () => this.$emit('edit', this.object) }
        },
        {
          title: this.$t('PolicyEventCycle'),
          has:
            this.object.mode === 'subscription' &&
            this.$hasPerm('accounts.change_applicationcredential'),
          attrs: {
            type: 'primary',
            label: this.$t('StartNewPolicyCycle'),
            loading: this.cycleStarting,
            disabled: !this.object.is_active || this.object.status !== 'idle'
          },
          callbacks: { click: () => this.$emit('start-cycle') }
        },
        this.rotationAction,
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
            [
              'preparing',
              'waiting_standby',
              'ready_to_switch',
              'waiting_switch',
              'ready_for_change',
              'change_failed'
            ].includes(this.object.status) &&
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
    async loadRotationStatus() {
      clearTimeout(this.rotationStatusTimer)
      if (this.object.mode !== 'alternating_rotation' || !this.object.id) {
        this.rotationStatus = null
        return
      }
      try {
        this.rotationStatus = await getCredentialRotationStatus(this.object.id)
      } finally {
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
      if (
        this.disposed ||
        (this.object.precheck?.status !== 'checking' &&
          !['preparing', 'waiting_standby', 'ready_to_switch'].includes(this.object.status))
      ) {
        return
      }
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
      if (this.object.status === 'idle') {
        this.$emit('start-cycle')
        return
      }
      const createTask = this.object.status === 'ready_for_change'
      if (createTask) {
        if (this.object.rotation?.automation_id) return this.executeSavedTask()
        return this.openChangeSecretForm()
      }
      const previousStatus = this.object.status
      if (previousStatus === 'ready_to_switch') {
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
    }
  }
}
</script>

<style lang="scss" scoped>
.credential-info {
  display: grid;
  gap: 16px;
  margin-bottom: 16px;
  min-width: 0;
}
</style>
