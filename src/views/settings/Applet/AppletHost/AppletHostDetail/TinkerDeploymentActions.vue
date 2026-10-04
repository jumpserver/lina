<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import request from '@/utils/request'
import { hasPermission } from '@/utils/jms/permission'
import { openTaskPage } from '@/utils/jms/index'
import QuickActions from '@/components/Common/QuickActions/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import { useTinkerRefresh } from '../useTinkerRefresh'

interface AppletHost {
  date_synced?: string | null
  tinker_version?: string
}

const props = defineProps<{ hostId: string }>()
const emit = defineEmits<{ changed: [] }>()
const { t } = useI18n()
const host = shallowRef<AppletHost | null>(null)
const hasDeployed = shallowRef(false)
const dialogVisible = shallowRef(false)
const installApplets = shallowRef(false)
const submitting = shallowRef(false)
const canView = computed(() => hasPermission('terminal.view_applethost'))
const canDeploy = computed(() => hasPermission('terminal.add_applethostdeployment'))
const deployLabel = computed(() => t(hasDeployed.value ? 'AppletHostRedeploy' : 'Deploy'))
const actions = computed(() => [
  {
    title: t('HostDeployment'),
    attrs: {
      type: 'primary',
      label: deployLabel.value,
      disabled: !host.value || dialogVisible.value || submitting.value,
      loading: submitting.value
    },
    callbacks: { click: openDeployment }
  }
])

const refresh = useTinkerRefresh(async (signal) => {
  if (!canView.value) return
  const currentHost = await request.get(`/api/v1/terminal/applet-hosts/${props.hostId}/`, {
    signal
  })
  if (signal.aborted) return
  if (host.value?.tinker_version !== currentHost.tinker_version) emit('changed')
  host.value = currentHost
  // Deployment temporarily clears the report; keep the redeploy defaults during refreshes.
  hasDeployed.value ||= Boolean(currentHost.date_synced || currentHost.tinker_version?.trim())
})

function openDeployment() {
  if (!host.value || !canView.value || !canDeploy.value || submitting.value) return
  installApplets.value = !hasDeployed.value
  dialogVisible.value = true
}

async function deploy() {
  if (
    !host.value ||
    !canView.value ||
    !canDeploy.value ||
    !dialogVisible.value ||
    submitting.value
  ) {
    return
  }
  submitting.value = true
  try {
    const result = await request.post('/api/v1/terminal/applet-host-deployments/', {
      host: props.hostId,
      install_applets: installApplets.value
    })
    dialogVisible.value = false
    emit('changed')
    openTaskPage(result.task)
    refresh()
  } catch {
    // Keep the selection for retry; API errors are displayed by the request client.
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <template v-if="canView && canDeploy">
    <QuickActions :actions="actions" type="primary" />
    <Dialog
      v-model:visible="dialogVisible"
      :title="deployLabel"
      width="520px"
      :close-on-click-modal="false"
      :close-on-press-escape="!submitting"
      :show-close="!submitting"
    >
      <p class="deployment-message">{{ t('AppletHostDeployConfirm') }}</p>
      <el-checkbox v-model="installApplets" :disabled="submitting">
        {{ t('AppletHostInstallApplets') }}
      </el-checkbox>
      <template #footer>
        <el-button :disabled="submitting" @click="dialogVisible = false">
          {{ t('Cancel') }}
        </el-button>
        <el-button type="primary" :loading="submitting" @click="deploy">
          {{ deployLabel }}
        </el-button>
      </template>
    </Dialog>
  </template>
</template>

<style scoped>
.deployment-message {
  margin: 0 0 16px;
  line-height: 1.6;
}
</style>
