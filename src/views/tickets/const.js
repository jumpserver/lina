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

export const APP_CATEGORY_TYPE_OPTIONS = [
  {
    label: this.$t(`applications.applicationsCategory.db`),
    value: 'db',
    children: [
      {
        label: 'MySQL',
        value: 'mysql'
      },
      {
        label: 'Oracle',
        value: 'oracle'
      },
      {
        label: 'PostgreSQL',
        value: 'postgresql'
      },
      {
        label: 'MariaDB',
        value: 'mariadb'
      }
    ]
  },
  {
    label: this.$t(`applications.applicationsCategory.cloud`),
    value: 'cloud',
    children: [
      {
        label: 'Kubernetes',
        value: 'k8s'
      }
    ]
  },
  {
    label: this.$t(`applications.applicationsCategory.remote_app`),
    value: 'remote_app',
    children: [
      {
        label: 'MySQL Workbench',
        value: 'mysql_workbench'
      },
      {
        label: 'vSphere Client',
        value: 'vmware_client'
      },
      {
        label: 'Custom',
        value: 'custom'
      }, {
        label: 'Chrome',
        value: 'chrome'
      }
    ]
  }
]
