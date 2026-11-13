<template>
  <TabPage
    v-model:active-menu="activeMenu"
    :title="$t('FileTransfer')"
    :submenu="submenu"
    :clear-query-keys-on-tab-change="queryKeys"
  >
    <FTPLogList
      v-if="contentReady"
      :key="`${activeMenu}:${orgId}`"
      embedded
      :category="activeMenu === 'AgentTransfers' ? 'agent' : ''"
      :org-id="orgId"
    />
  </TabPage>
</template>

<script setup>
import { computed, onActivated, onDeactivated, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import TabPage from '@/layout/components/TabPage'
import FTPLogList from '@/views/sessions/FTPLogList.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()
const { t } = useI18n()
const activeMenu = ref('AllTransfers')
const active = ref(true)
const submenu = computed(() => [
  { name: 'AllTransfers', title: t('All') },
  { name: 'AgentTransfers', title: t('AgentFileTransfers') }
])
const orgId = computed(() => route.query.oid || store.getters.currentOrg?.id)
const queryKeys = computed(() =>
  Object.keys(route.query).filter((key) => !['oid', 'tab'].includes(key))
)
const contentReady = computed(() => {
  const selected = String(route.query.tab || '').toLowerCase()
  const tab = submenu.value.find((item) => item.name.toLowerCase() === selected)
  return !tab || tab.name === activeMenu.value
})
watch(
  () => store.getters.currentOrg?.id,
  (next, previous) => {
    if (
      active.value &&
      route.name === 'FtpLog' &&
      previous &&
      next &&
      next !== previous &&
      route.query.oid
    ) {
      router.replace({ query: { ...route.query, oid: next } })
    }
  }
)
onActivated(() => {
  active.value = true
})
onDeactivated(() => {
  active.value = false
})
</script>
