<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import request from '@/utils/request'
import { hasPermission } from '@/utils/jms/permission'
import { useTinkerRefresh } from './useTinkerRefresh'

withDefaults(defineProps<{ showLink?: boolean }>(), { showLink: true })
const { t } = useI18n()
const canView = computed(() => hasPermission('terminal.view_applethost'))
const target = shallowRef('')
const needsAttention = shallowRef(false)

useTinkerRefresh(async (signal) => {
  if (!canView.value) return
  const response = await request.get('/api/v1/terminal/applet-hosts/', {
    params: { needs_attention: true, limit: 1 },
    signal,
    disableFlashErrorMsg: true
  })
  if (signal.aborted) return
  const hosts = Array.isArray(response) ? response : response.results || []
  needsAttention.value = hosts.length > 0
  target.value = hosts[0]?.tinker_target_version || ''
})
</script>

<template>
  <el-alert
    v-if="canView && needsAttention"
    class="tinker-notice"
    type="warning"
    :closable="false"
    show-icon
  >
    <span>{{ t('TinkerVersionAttention', { version: target }) }}</span>
    <router-link v-if="showLink" :to="{ name: 'Applets', query: { tab: 'AppletHosts' } }">
      {{ t('View') }}
    </router-link>
  </el-alert>
</template>

<style scoped>
.tinker-notice {
  margin-bottom: 12px;
}
.tinker-notice a {
  margin-left: 12px;
}
</style>
