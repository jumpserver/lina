import AssetSelect from '@/components/Apps/AssetSelect'
import AccountFormatter from './components/AccountFormatter'

function getFields() {
  const users = {
    label: this.$t('Users'),
    hidden: () => false,
    el: {
      value: [],
      ajax: {
        url: '/api/v1/users/users/?fields_size=mini',
        transformOption: (item) => {
          return { label: item.name + '(' + item.username + ')', value: item.id }
        }
      }
    }
  }

  const user_groups = {
    label: this.$t('UserGroups'),
    hidden: () => false,
    el: {
      value: [],
      url: '/api/v1/users/groups/'
    }
  }

  const assets = {
    type: 'assetSelect',
    hidden: () => false,
    component: AssetSelect,
    label: this.$t('Asset'),
    rules: [{
      required: false
    }],
    el: {
      value: []
    }
  }

  const nodes = {
    label: this.$t('Node'),
    hidden: () => false,
    el: {
      value: [],
      ajax: {
        url: '/api/v1/assets/nodes/',
        transformOption: (item) => {
          return { label: item.full_value, value: item.id }
        }
      }
    }
  }

  const accounts = {
    type: 'input',
    label: this.$t('Account'),
    component: AccountFormatter
  }

  const date_start = {
    label: this.$t('DateStart'),
    hidden: () => false
  }

  const date_expired = {
    label: this.$t('DateExpired'),
    hidden: () => false
  }

  const is_active = {
    label: this.$t('IsActive'),
    type: 'checkbox'
  }

  const applications = {
    label: this.$t('Applications'),
    hidden: () => false,
    el: {
      value: [],
      ajax: {
        url: `/api/v1/applications/applications/`,
        transformOption: (item) => {
          return { label: item.name + ' (' + item.type_display + ')', value: item.id }
        }
      }
    }
  }

  return {
    users: users,
    user_groups: user_groups,
    assets: assets,
    applications: applications,
    nodes: nodes,
    accounts: accounts,
    is_active: is_active,
    date_start: date_start,
    date_expired: date_expired
  }
}

export default getFields
