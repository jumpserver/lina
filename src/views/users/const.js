import { JSONManyToManySelect } from '@/components/FormFields'

export const userJSONSelectMeta = (vm) => {
  return {
    component: JSONManyToManySelect,
    el: {
      value: [],
      resource: vm.$t('users.Users'),
      select2: {
        ajax: {
          url: '/api/v1/users/users/?fields_size=mini',
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        }
      },
      attrs: [
        {
          name: 'name',
          label: vm.$t('common.Name')
        },
        {
          name: 'username',
          label: vm.$t('common.Username')
        }
      ]
    }
  }
}
