import i18n from '@/i18n/i18n'

export const riskActions = [
  {
    name: 'disable_remote',
    label: i18n.t('Disable remote'),
    has: ['long_time_no_login', 'new_found']
  },
  {
    name: 'delete_remote',
    label: i18n.t('Delete Account'),
    has: ['long_time_no_login', 'new_found']
  },
  {
    name: 'delete_both',
    label: i18n.t('Delete Both'),
    has: ['long_time_no_login']
  },
  {
    name: 'add_account',
    label: i18n.t('Add to Account'),
    has: ['new_found'],
    disabled: async function() {
      const url = `/api/v1/accounts/accounts/?username=${this.row.username}&asset=${this.row.asset.id}`
      const data = await this.$axios.get(url)
      return data.length > 0
    }
  },
  {
    name: 'change_password',
    label: i18n.t('Change Password'),
    has: ['long_time_password', 'weak_password', 'password_expired']
  },
  // {
  //   name: 'addPrivilegedAccount',
  //   label: i18n.t('Add Privileged Account'),
  //   has: ['no_admin_account']
  // },
  // {
  //   name: 'modifyPassword',
  //   label: i18n.t('Modify Password'),
  //   has: ['password_error']
  // },
  {
    name: 'review',
    label: i18n.t('Review'),
    has: ['group_changed', 'sudo_changed', 'authorized_key_changed', 'account_deleted', 'others']
  }
]
