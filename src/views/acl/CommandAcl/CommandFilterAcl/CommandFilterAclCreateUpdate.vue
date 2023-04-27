<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :fields-meta="fieldsMeta"
    :initial="initial"
    :url="url"
    v-bind="$data"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { JSONManyToManySelect } from '@/components/FormFields'
import rules from '@/components/DataForm/rules'
import { cleanFormValueForHandleUserAssetAccount } from '../../common'

export default {
  name: 'CommandFilterAclCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        is_active: true
      },
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('perms.User'), ['users']],
        [this.$t('perms.Asset'), ['assets']],
        [this.$t('perms.Account'), ['accounts']],
        [this.$t('acl.CommandGroup'), ['command_groups']],
        [this.$t('common.action'), ['action', 'reviewers']],
        [this.$t('common.Other'), ['priority', 'is_active', 'comment']]
      ],
      url: '/api/v1/acls/command-filter-acls/',
      createSuccessNextRoute: { name: 'CommandFilterAclList' },
      fieldsMeta: {
        users: {
          component: JSONManyToManySelect,
          el: {
            value: [],
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
                label: this.$t('common.Name')
              },
              {
                username: 'username',
                label: this.$t('common.Username')
              }
            ]
          }
        },
        assets: {
          fields: ['name_group', 'address_group']
        },
        accounts: {
          fields: ['username_group']
        },
        action: {
        },
        command_groups: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/acls/command-groups/?fields_size=mini',
              transformOption: (item) => {
                return { label: item.name, value: item.id }
              }
            }
          }
        },
        reviewers: {
          hidden: (item) => item.action !== 'review',
          rules: [rules.RequiredChange],
          el: {
            value: [],
            ajax: {
              url: '/api/v1/users/users/?fields_size=mini',
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
          }
        },
        is_active: {
          type: 'checkbox'
        }
      },
      cleanFormValue: cleanFormValueForHandleUserAssetAccount
    }
  }
}
</script>

<style scoped>

</style>
