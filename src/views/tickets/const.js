import i18n from '@/i18n/i18n'

export const OPEN = 'pending'
export const APPROVE = 'approved'
export const REJECT = 'rejected'
export const CLOSED = 'closed'

export const STATUS_MAP = {
  [OPEN]: {
    type: 'success', title: i18n.t('Pending')
  },
  [APPROVE]: {
    type: 'primary', title: i18n.t('Approved')
  },
  [REJECT]: {
    type: 'danger', title: i18n.t('Rejected')
  },
  [CLOSED]: {
    type: 'info', title: i18n.t('Closed')
  }
}

export const STATE_MAP = {
  [OPEN]: {
    type: 'success', title: i18n.t('Pending')
  },
  [APPROVE]: {
    type: 'primary', title: i18n.t('Approved')
  },
  [REJECT]: {
    type: 'danger', title: i18n.t('Rejected')
  },
  [CLOSED]: {
    type: 'warning', title: i18n.t('StateClosed')
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
