import { ResourceSelect, TreeResourceSelect } from '@/components/Form/FormFields'
import AccountFormatter from './components/AccountFormatter'

function getFields() {
  const users = {
    type: 'resourceSelect',
    component: ResourceSelect,
    hidden: () => false,
    rules: [{ required: false }],
    el: {
      value: [],
      url: '/api/v1/users/users/?fields_size=mini',
      resourceName: this.$t('Users')
    }
  }

  const user_groups = {
    type: 'resourceSelect',
    component: ResourceSelect,
    hidden: () => false,
    rules: [{ required: false }],
    el: {
      value: [],
      url: '/api/v1/users/groups/?fields_size=mini',
      resourceName: this.$t('UserGroups')
    }
  }

  const assets = {
    type: 'resourceSelect',
    hidden: () => false,
    component: ResourceSelect,
    rules: [{ required: false }],
    el: {
      value: [],
      url: '/api/v1/assets/assets/?fields_size=mini',
      resourceName: this.$t('Assets'),
      nodeFilter: {
        treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
        typeTreeUrl: '/api/v1/assets/nodes/category/tree/?count_resource=none',
        includeDescendants: true
      }
    }
  }

  const nodes = {
    type: 'treeResourceSelect',
    component: TreeResourceSelect,
    hidden: () => false,
    rules: [{ required: false }],
    el: {
      url: '/api/v1/assets/nodes/?fields_size=mini',
      treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
      resourceName: this.$t('Nodes')
    }
  }

  const accounts = {
    type: 'input',
    component: AccountFormatter
  }

  const date_start = {
    hidden: () => false
  }

  const date_expired = {
    hidden: () => false
  }

  const is_active = {
    type: 'checkbox'
  }

  const applications = {
    type: 'resourceSelect',
    component: ResourceSelect,
    hidden: () => false,
    rules: [{ required: false }],
    el: {
      value: [],
      url: '/api/v1/applications/applications/?fields_size=mini',
      resourceName: this.$t('Applications')
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
