import i18n from '@/i18n/i18n'

export const OPEN = 'notified'
export const APPROVE = 'approved'
export const REJECT = 'rejected'
export const OTHER = 'closed'

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
