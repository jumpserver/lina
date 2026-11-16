<template>
  <AccountRotationPrototype v-if="hasValidLicense" mode="alternating_rotation" />
  <div v-else class="rotation-license-content">
    <AccountRotationPrototype inert mode="alternating_rotation" preview />
    <EnterpriseUpgradeMask />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import EnterpriseUpgradeMask from '@/layout/components/Page/EnterpriseUpgradeMask.vue'
import AccountRotationPrototype from './AccountRotationPrototype.vue'

const store = useStore()
const hasValidLicense = computed(() => store.getters.hasValidLicense)
</script>

<style scoped>
.rotation-license-content {
  position: relative;
  flex: 1 0 auto;
}
</style>
