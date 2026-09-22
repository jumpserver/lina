<template>
  <div class="application-credential-detail">
    <el-tabs v-model="activeTab">
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
    </el-tabs>
  </div>
</template>

<script>
import AccountRotationInfo from './AccountRotationInfo.vue'
import ClientAccessPrototype from '../ApplicationDetail/ClientAccessPrototype.vue'

export default {
  name: 'ApplicationCredentialDetail',
  components: { AccountRotationInfo, ClientAccessPrototype },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'updated'],
  data() {
    return {
      activeTab: 'basic'
    }
  },
  methods: {
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
