<template>
  <TabPage
    v-model:active-menu="activeTab"
    :submenu="submenu"
    title="null"
    navigation-scope="local"
    class="application-credential-detail"
    @tab-click="refreshEvents"
  >
    <AccountRotationInfo
      ref="rotationInfo"
      v-show="activeTab === 'basic'"
      :object="object"
      :cycle-starting="cycleStarting"
      @edit="$emit('edit', object)"
      @updated="$emit('updated', $event)"
      @start-cycle="startCycle"
    />
    <ClientAccessPrototype
      v-if="$hasPerm('accounts.view_integrationapplication')"
      v-show="activeTab === 'access'"
      :key="object.id"
      :object="object"
    />
    <CredentialEventBrowser
      v-if="activeTab === 'events'"
      ref="eventBrowser"
      :key="eventsKey"
      :credential-id="object.id"
      :subscription="object.mode === 'subscription'"
      :initial-cycle-id="startedCycleId"
    >
      <template #actions="{ cycle }">
        <el-button
          v-if="pendingRotationAction && cycle?.id === object.rotation?.id"
          :type="pendingRotationAction.attrs.type"
          :loading="pendingRotationAction.attrs.loading"
          :disabled="pendingRotationAction.attrs.disabled"
          @click="advanceRotationFromEvents"
          >{{ pendingRotationAction.attrs.label }}</el-button
        >
        <el-tooltip
          v-else-if="$hasPerm('accounts.change_applicationcredential')"
          :content="$t('PolicyCycleRunningHelp')"
          :disabled="object.status === 'idle'"
        >
          <el-button
            type="primary"
            :loading="cycleStarting"
            :disabled="
              !object.is_active ||
              object.status !== 'idle' ||
              object.precheck?.status === 'checking'
            "
            @click="startCycle"
            >{{ $t('StartNewPolicyCycle') }}</el-button
          >
        </el-tooltip>
      </template>
    </CredentialEventBrowser>
    <CredentialPolicyDocumentation v-if="activeTab === 'docs'" :object="object" />
  </TabPage>
</template>

<script>
import { ref } from 'vue'
import TabPage from '@/layout/components/TabPage'
import AccountRotationInfo from './AccountRotationInfo.vue'
import CredentialEventBrowser from './CredentialEventBrowser.vue'
import CredentialPolicyDocumentation from './CredentialPolicyDocumentation.vue'
import ClientAccessPrototype from '../ApplicationDetail/ClientAccessPrototype.vue'
import { startApplicationCredentialCycle } from '@/api/applicationCredential'

export default {
  name: 'ApplicationCredentialDetail',
  components: {
    TabPage,
    AccountRotationInfo,
    ClientAccessPrototype,
    CredentialEventBrowser,
    CredentialPolicyDocumentation
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'updated'],
  setup() {
    const rotationInfo = ref(null)
    const eventBrowser = ref(null)
    return { rotationInfo, eventBrowser }
  },
  data() {
    return {
      activeTab: 'basic',
      eventsKey: 0,
      cycleStarting: false,
      startedCycleId: ''
    }
  },
  computed: {
    pendingRotationAction() {
      if (this.object.status === 'idle') return null
      const action = this.rotationInfo?.rotationAction
      return action?.has ? action : null
    },
    submenu() {
      return [
        { title: this.$t('Basic'), name: 'basic' },
        {
          title: this.$t('BoundApplications'),
          name: 'access',
          hidden: !this.$hasPerm('accounts.view_integrationapplication')
        },
        { title: this.$t('CredentialPolicyRunRecords'), name: 'events' },
        { title: this.$t('Documentation'), name: 'docs' }
      ]
    }
  },
  methods: {
    async advanceRotationFromEvents() {
      const action = this.pendingRotationAction
      if (
        !action ||
        action.attrs.disabled ||
        action.attrs.loading ||
        this.eventBrowser?.cycleId !== this.object.rotation?.id
      ) {
        return
      }
      await action.callbacks.click()
      await this.eventBrowser?.loadCycles()
    },
    async startCycle() {
      if (this.cycleStarting || !this.object.is_active || this.object.status !== 'idle') return
      this.cycleStarting = true
      const subscription = this.object.mode === 'subscription'
      try {
        try {
          await this.$confirm(
            this.$t(
              subscription
                ? 'StartSubscriptionNotificationCycleConfirm'
                : 'StartRotationCycleConfirm'
            ),
            this.$t('StartNewPolicyCycle'),
            { type: 'info' }
          )
        } catch {
          return
        }
        const { credential, cycle_id } = await startApplicationCredentialCycle(this.object.id)
        this.$emit('updated', credential)
        this.startedCycleId = cycle_id
        this.eventsKey += 1
        this.activeTab = 'events'
        this.$message.success(this.$t('PolicyCycleStarted'))
      } finally {
        this.cycleStarting = false
      }
    },
    refreshEvents(tab) {
      if (tab.paneName !== 'events') return
      this.eventsKey += 1
    }
  }
}
</script>
