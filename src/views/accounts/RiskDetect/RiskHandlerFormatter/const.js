import i18n from '@/i18n/i18n'

async function checkUserExist() {
  if (!this.row.username) {
    return false
  }
  const url = `/api/v1/accounts/accounts/?username=${encodeURIComponent(this.row.username)}&asset=${this.row.asset.id}`
  const data = await this.$axios.get(url)
  return data.length > 0
}

export const riskActions = [
  // {
  //   name: 'disable_remote',
  //   label: i18n.t('Disable remote'),
  //   has: ['long_time_no_login', 'new_found']
  // },
  {
    name: 'delete_remote',
    label: i18n.t('SyncDeleteSelected'),
    has: ['long_time_no_login', 'new_found']
  },
  {
    name: 'delete_both',
    label: i18n.t('DeleteBoth'),
    has: ['long_time_no_login']
  },
  {
    name: 'add_account',
    label: i18n.t('AddAccount'),
    has: ['new_found'],
    disabled: async function() {
      return await checkUserExist.call(this)
    }
  },
  {
    name: 'change_password_add',
    label: i18n.t('AddAccountAfterChangingPassword'),
    has: async function() {
      const risks = ['new_found', 'long_time_password', 'password_expired']
      return risks.includes(this.row.risk.value) && !await checkUserExist.call(this)
    }
  },
  {
    name: 'change_password',
    label: i18n.t('ChangePassword'),
    has: async function() {
      const risks = [
        'long_time_password', 'weak_password', 'password_expired',
        'leaked_password', 'repeated_password'
      ]
      return risks.includes(this.row.risk.value) && await checkUserExist.call(this)
    }
  },
  {
    name: 'delete_account',
    label: i18n.t('DeleteAccount'),
    has: async function() {
      const risks = ['account_deleted']
      return risks.includes(this.row.risk.value) && await checkUserExist.call(this)
    }
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
  },
  {
    name: 'ignore',
    label: i18n.t('Ignore'),
    has: false
  },
  {
    name: 'reopen',
    label: i18n.t('Reopen'),
    has: false
  },
  {
    name: 'close',
    label: i18n.t('Close'),
    has: false
  }
]
