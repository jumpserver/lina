import i18n from '@/i18n/i18n'

export const OPEN = 'pending'
export const APPROVE = 'approved'
export const REJECT = 'rejected'
export const CLOSED = 'closed'

export const STATUS_MAP = {
  [OPEN]: {
    type: 'success', title: i18n.t('tickets.Pending')
  },
  [APPROVE]: {
    type: 'primary', title: i18n.t('tickets.Approved')
  },
  [REJECT]: {
    type: 'danger', title: i18n.t('tickets.Rejected')
  },
  [CLOSED]: {
    type: 'info', title: i18n.t('tickets.Closed')
  }
}

export const STATE_MAP = {
  [OPEN]: {
    type: 'success', title: i18n.t('tickets.Pending')
  },
  [APPROVE]: {
    type: 'primary', title: i18n.t('tickets.Approved')
  },
  [REJECT]: {
    type: 'danger', title: i18n.t('tickets.Rejected')
  },
  [CLOSED]: {
    type: 'warning', title: i18n.t('tickets.StateClosed')
  }
}

export const treeNodes = [
  {
    value: 'all',
    label: i18n.t('perms.all'),
    children: [
      {
        value: 'connect',
        label: i18n.t('perms.connect')
      },
      {
        value: 'updownload',
        label: i18n.t('route.FileTransfer'),
        children: [
          {
            value: 'upload',
            label: i18n.t('perms.uploadFile')
          },
          {
            value: 'download',
            label: i18n.t('perms.downloadFile')
          }
        ]
      },
      {
        value: 'copy_paste',
        label: i18n.t('perms.clipboardCopyPaste'),
        children: [
          {
            value: 'copy',
            label: i18n.t('common.Copy')
          },
          {
            value: 'paste',
            label: i18n.t('common.Paste')
          }
        ]
      }
    ]
  }
]
