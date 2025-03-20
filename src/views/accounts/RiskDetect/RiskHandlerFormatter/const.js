import i18n from '@/i18n/i18n'
const accountExistCache = new Map()

async function checkAccountExist(username, asset) {
  const cacheKey = `${username}-${asset}`
  if (accountExistCache.has(cacheKey)) {
    return accountExistCache.get(cacheKey)
  }
  const url = `/api/v1/accounts/accounts/?username=${encodeURIComponent(username)}&asset=${asset}`
  const data = await this.$axios.get(url)
  const result = data.length > 0
  accountExistCache.set(cacheKey, result)
  return result
}

async function checkAccountsExist() {
  // 批量选择,所有都存在返回 true
  if (this.rows.length > 0) {
    for (const row of this.rows) {
      if (!await checkAccountExist.call(this, row.username, row.asset.id)) {
        return false
      }
    }
    return true
  }
  // 单个选择
  if (this.row.username) {
    return await checkAccountExist.call(this, this.row.username, this.row.asset.id)
  }
  return false
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
      return await checkAccountsExist.call(this)
    }
  },
  {
    name: 'change_password_add',
    label: i18n.t('AddAccountAfterChangingPassword'),
    has: async function() {
      const risks = ['new_found', 'long_time_password', 'password_expired']
      return risks.includes(this.row.risk.value) && !await checkAccountsExist.call(this)
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
      return risks.includes(this.row.risk.value) && await checkAccountsExist.call(this)
    }
  },
  {
    name: 'delete_account',
    label: i18n.t('DeleteAccount'),
    has: async function() {
      const risks = ['account_deleted']
      return risks.includes(this.row.risk.value) && await checkAccountsExist.call(this)
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
