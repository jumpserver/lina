<template>
  <div class="application-credential-detail">
    <el-tabs v-model="activeTab" @tab-click="refreshEvents">
      <el-tab-pane :label="$t('Basic')" name="basic">
        <AccountRotationInfo :object="object" @edit="$emit('edit', object)" @updated="updated" />
      </el-tab-pane>
      <el-tab-pane
        v-if="$hasPerm('accounts.view_clientaccessconfiguration')"
        :label="$t('ClientAccessConfigurations')"
        name="access"
      >
        <ClientAccessPrototype :key="object.id" :object="object" />
      </el-tab-pane>
      <el-tab-pane :label="$t('RotationEventReception')" name="events">
        <RotationEventTimeline
          v-if="activeTab === 'events'"
          :key="eventsKey"
          :credential-id="object.id"
          :subscription="object.mode === 'subscription'"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import AccountRotationInfo from './AccountRotationInfo.vue'
import RotationEventTimeline from './RotationEventTimeline.vue'
import ClientAccessPrototype from '../ApplicationDetail/ClientAccessPrototype.vue'

export default {
  name: 'ApplicationCredentialDetail',
  components: {
    AccountRotationInfo,
    ClientAccessPrototype,
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
      eventsKey: 0
    }
  },
  methods: {
    refreshEvents(tab) {
      if (tab.paneName !== 'events') return
      this.eventsKey += 1
    },
    updated(value) {
      this.$emit('updated', value)
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
