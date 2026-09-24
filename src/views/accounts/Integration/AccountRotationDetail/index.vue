<template>
  <div class="application-credential-detail">
    <el-tabs v-model="activeTab" @tab-click="refreshEvents">
      <el-tab-pane :label="$t('Basic')" name="basic">
        <AccountRotationInfo :object="object" @edit="$emit('edit', object)" @updated="updated" />
        <RotationEventTimeline
          v-if="object.mode === 'alternating_rotation'"
          ref="rotationEvents"
          :key="object.id"
          :credential-id="object.id"
          overview
          @view-history="viewClientHistory"
        />
      </el-tab-pane>
      <el-tab-pane
        v-if="$hasPerm('accounts.view_clientaccessconfiguration')"
        :label="$t('ClientAccessConfigurations')"
        name="access"
      >
        <ClientAccessPrototype :key="object.id" :object="object" />
      </el-tab-pane>
      <el-tab-pane :label="$t('RotationEventReception')" name="events">
        <CredentialEventBrowser
          v-if="activeTab === 'events'"
          :key="eventsKey"
          :credential-id="object.id"
          :subscription="object.mode === 'subscription'"
          :initial-client="historyClient"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import AccountRotationInfo from './AccountRotationInfo.vue'
import CredentialEventBrowser from './CredentialEventBrowser.vue'
import RotationEventTimeline from './RotationEventTimeline.vue'
import ClientAccessPrototype from '../ApplicationDetail/ClientAccessPrototype.vue'

export default {
  name: 'ApplicationCredentialDetail',
  components: {
    AccountRotationInfo,
    ClientAccessPrototype,
    CredentialEventBrowser,
    RotationEventTimeline
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'updated'],
  data() {
    return {
      activeTab: 'basic',
      eventsKey: 0,
      historyClient: null
    }
  },
  methods: {
    refreshEvents(tab) {
      if (tab.paneName === 'basic') this.$refs.rotationEvents?.load()
      if (tab.paneName !== 'events') return
      this.historyClient = null
      this.eventsKey += 1
    },
    viewClientHistory(client) {
      this.historyClient = client
      this.eventsKey += 1
      this.activeTab = 'events'
    },
    updated(value) {
      this.$emit('updated', value)
      this.$refs.rotationEvents?.load()
    }
  }
}
</script>

<style lang="scss" scoped>
.application-credential-detail {
  min-height: 100%;
  padding: 0 20px 20px;
}
</style>
