import { JSONManyToManySelect } from '@/components/FormFields'

export const userJSONSelectMeta = (vm) => {
  return {
    component: JSONManyToManySelect,
    el: {
      value: [],
      resource: vm.$t('users.Users'),
      select2: {
        url: '/api/v1/users/users/',
        ajax: {
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        }
      },
      attrs: [
        {
          name: 'name',
          label: vm.$t('common.Name'),
          inTable: true
        },
        {
          name: 'username',
          label: vm.$t('common.Username'),
          inTable: true
        },
        {
          name: 'email',
          label: vm.$t('common.Email'),
          inTable: true
        },
        {
          name: 'comment',
          label: vm.$t('common.Comment')
        },
        {
          name: 'is_active',
          label: vm.$t('common.IsActive'),
          type: 'bool'
        },
        {
          name: 'system_roles',
          label: vm.$t('users.SystemRoles'),
          type: 'm2m',
          el: {
            url: '/api/v1/rbac/system-roles/?fields_size=mini',
            ajax: {
              transformOption: (item) => {
                return { label: item.display_name, value: item.id }
              }
            },
            displayField: 'display_name'
          }
        },
        {
          name: 'org_roles',
          label: vm.$t('users.OrgRoles'),
          type: 'm2m',
          el: {
            url: '/api/v1/rbac/org-roles/',
            ajax: {
              transformOption: (item) => {
                return { label: item.display_name, value: item.id }
              }
            },
            displayField: 'display_name'
          }
        },
        {
          name: 'groups',
          label: vm.$t('users.UserGroups'),
          type: 'm2m',
          el: {
            url: '/api/v1/users/groups/?fields_size=mini'
          }
        }
      ]
    }
  }
}
