import { defineAsyncComponent } from 'vue'

// Only locally registered components are loaded; API metadata never names executable code.
const plugins = {
  apply_asset: {
    form: defineAsyncComponent(() => import('../RequestAssetPerm/CreateUpdate.vue')),
    createRoute: 'RequestAssetPermTicketCreateUpdate',
    detailRoute: 'AssetsTicketDetail',
    fields: { apply_actions: { label: 'Actions', helpText: 'ActionsTips' } }
  },
  login_confirm: { detailRoute: 'LoginTicketDetail' },
  login_asset_confirm: { detailRoute: 'LoginAssetTicketDetail' },
  command_confirm: { detailRoute: 'CommandConfirmDetail' },
  view_secret: {
    resultComponent: defineAsyncComponent(() => import('../components/TicketSecretAccess.vue')),
    fields: { duration: { label: 'TicketSecretDuration', helpText: 'TicketSecretDurationHelp' } }
  },
  change_secret: {
    resultComponent: defineAsyncComponent(
      () => import('../components/TicketChangeSecretResult.vue')
    ),
    summary: 'TicketChangeSecretApplyHelp'
  },
  download_replay: {
    resultComponent: defineAsyncComponent(() => import('../components/TicketReplayAccess.vue')),
    fields: { duration: { helpText: 'TicketReplayDurationHelp' } },
    requestLabels: {
      session_asset: 'Asset',
      session_account: 'Account',
      session_user: 'User',
      session_date_start: 'DateStart'
    },
    dateFields: ['session_date_start']
  },
  file_transfer: {
    requestComponent: defineAsyncComponent(
      () => import('../components/TicketFileTransferResult.vue')
    ),
    fields: {
      paths: {
        label: 'TicketTransferFilePath',
        helpTip: 'TicketTransferExactPathsHelp',
        placeholder: 'TicketTransferPathExample'
      },
      target_directory: {
        label: 'TicketTransferTargetDirectory',
        helpTip: 'TicketTransferTargetHelp',
        placeholder: 'TicketTransferDirectoryExample'
      },
      files: { label: 'TicketTransferFiles' },
      direction: {
        label: 'TicketTransferDirection',
        choices: { upload: 'Upload', download: 'Download' }
      },
      duration: { helpText: 'TicketTransferExecutionDurationHelp' }
    },
    requestLabels: {
      paths: 'TicketTransferFilePath',
      direction: 'TicketTransferDirection',
      target_directory: 'TicketTransferTargetDirectory'
    },
    requestChoices: { direction: { upload: 'Upload', download: 'Download' } }
  }
}

export function getTicketPlugin(type) {
  return plugins[type] || {}
}

export function getTicketDetailRoute(type) {
  return getTicketPlugin(type).detailRoute || 'TicketDetail'
}

export function getTicketCreateRoute(type) {
  const name = getTicketPlugin(type).createRoute
  return name ? { name } : { name: 'PluginTicketCreate', query: { type } }
}

export function configurePluginField(plugin, field, meta, t) {
  if (field.name === 'duration') {
    meta.label = t('WFFieldValidity')
    if (plugin.execution_mode === 'approval_only') meta.helpText = t('TicketApprovalDurationHelp')
  }
  const config = getTicketPlugin(plugin.type).fields?.[field.name]
  if (!config) return
  if (config.label) meta.label = t(config.label)
  if (config.placeholder) meta.el.placeholder = t(config.placeholder)
  if (config.helpTip) {
    meta.helpText = ''
    meta.helpTip = t(config.helpTip)
  }
  if (
    config.helpText &&
    !(field.name === 'duration' && plugin.execution_mode === 'approval_only')
  ) {
    meta.helpText = t(config.helpText)
  }
  if (config.choices) {
    meta.el.options = field.choices.map((item) => ({
      ...item,
      label: t(config.choices[item.value] || item.label)
    }))
  }
}
