<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { hasPermission } from '@/utils/jms/permission'
import { openTaskPage } from '@/utils/jms/index'
import QuickActions from '@/components/Common/QuickActions/index.vue'
import { useTinkerRefresh } from '../useTinkerRefresh'

interface QuickAction {
  title: string
  attrs: Record<string, unknown>
  callbacks: Record<string, () => void>
  has?: boolean
}

const props = defineProps<{ hostId: string; initialActions: QuickAction[] }>()
const emit = defineEmits<{ changed: [] }>()
const { t } = useI18n()
const host = shallowRef<Record<string, string> | null>(null)
const submitting = shallowRef(false)
const canView = computed(() => hasPermission('terminal.view_applethost'))
const canDeploy = computed(() => hasPermission('terminal.add_applethostdeployment'))
const actions = computed(() => [
  ...props.initialActions,
  {
    title: t('TinkerRedeploy'),
    has: Boolean(canView.value && canDeploy.value && host.value?.date_synced),
    attrs: {
      type: 'primary',
      label: t('Update'),
      disabled: submitting.value,
      loading: submitting.value
    },
    callbacks: { click: deploy }
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
})

async function deploy() {
  if (!host.value || submitting.value) return
  submitting.value = true
  try {
    await ElMessageBox.confirm(
      t('TinkerRedeployConfirm', {
        current: host.value.tinker_version?.trim() || t('TinkerVersionUnknown'),
        target: host.value.tinker_target_version
      }),
      t('TinkerRedeploy'),
      { type: 'warning', confirmButtonText: t('Confirm'), cancelButtonText: t('Cancel') }
    )
    const result = await request.post('/api/v1/terminal/applet-host-deployments/', {
      host: props.hostId,
      install_applets: false
    })
    emit('changed')
    openTaskPage(result.task)
    refresh()
  } catch {
    // Cancellation is expected; API errors are displayed by the request client.
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <QuickActions :actions="actions" type="primary" />
</template>
