import i18n from '@/i18n/i18n'

export const OPEN = 'open'
export const APPROVE = 'approve'
export const REJECT = 'reject'
export const OTHER = ''

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
  [OTHER]: {
    type: 'info', title: i18n.t('tickets.Closed')
  }
}
