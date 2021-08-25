import i18n from '@/i18n/i18n'

export const OPEN = 'notified'
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
