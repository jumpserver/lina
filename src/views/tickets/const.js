import i18n from '@/i18n/i18n'

export const OPEN = 'pending'
export const APPROVE = 'approved'
export const REJECT = 'rejected'
export const CLOSED = 'closed'

export const TICKET_TYPE_I18N_KEYS = {
  apply_asset: 'ApplyAsset',
  login_confirm: 'LoginConfirm',
  command_confirm: 'CommandConfirm',
  login_asset_confirm: 'LoginAssetConfirm'
}

export const TICKET_STATE_I18N_KEYS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  closed: 'StateClosed',
  reopen: 'Reopen',
  expired: 'WFExpired',
  error: 'WFError'
}

function translate(t, key) {
  return t ? t(key) : i18n.t(key)
}

export function getTicketTypeLabel(type, t) {
  if (!type) return ''
  const key = TICKET_TYPE_I18N_KEYS[type.value]
  return key ? translate(t, key) : type.label || ''
}

export function getTicketFlowLabel(ticketOrFlow, t) {
  if (ticketOrFlow?.workflow?.name) return ticketOrFlow.workflow.name
  if (ticketOrFlow?.flow === null && ticketOrFlow?.type?.value === 'apply_asset') {
    return translate(t, 'TicketFlowDeleted')
  }
  const type = ticketOrFlow?.type || ticketOrFlow?.flow?.type
  const customName = ticketOrFlow?.flow?.name || ticketOrFlow?.name
  // Built-in flows reuse the backend English type label as the default name.
  // Translate those; keep a user-renamed flow name as-is.
  if (customName && customName !== type?.label) {
    return customName
  }
  return getTicketTypeLabel(type, t) || customName || ''
}

export function getTicketStateLabel(state, t) {
  if (!state) return ''
  const key = TICKET_STATE_I18N_KEYS[state.value]
  return key ? translate(t, key) : state.label || ''
}

export const STATUS_MAP = {
  [OPEN]: {
    type: 'success',
    title: i18n.t('Pending')
  },
  [APPROVE]: {
    type: 'primary',
    title: i18n.t('Approved')
  },
  [REJECT]: {
    type: 'danger',
    title: i18n.t('Rejected')
  },
  [CLOSED]: {
    type: 'info',
    title: i18n.t('Closed')
  }
}

export const STATE_MAP = {
  [OPEN]: {
    type: 'success',
    title: i18n.t('Pending')
  },
  [APPROVE]: {
    type: 'primary',
    title: i18n.t('Approved')
  },
  [REJECT]: {
    type: 'danger',
    title: i18n.t('Rejected')
  },
  [CLOSED]: {
    type: 'warning',
    title: i18n.t('StateClosed')
  }
}

export const treeNodes = [
  {
    value: 'all',
    label: i18n.t('All'),
    children: [
      {
        value: 'connect',
        label: i18n.t('Connect')
      },
      {
        value: 'delete',
        label: i18n.t('Delete')
      },
      {
        value: 'share',
        label: i18n.t('Share')
      },
      {
        value: 'updownload',
        label: i18n.t('UpDownload'),
        children: [
          {
            value: 'upload',
            label: i18n.t('Upload')
          },
          {
            value: 'download',
            label: i18n.t('Download')
          }
        ]
      },
      {
        value: 'copy_paste',
        label: i18n.t('Clipboard'),
        children: [
          {
            value: 'copy',
            label: i18n.t('Copy')
          },
          {
            value: 'paste',
            label: i18n.t('Paste')
          }
        ]
      }
    ]
  }
]
