<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :initial="initial"
    :fields-meta="fieldsMeta"
    :url="url"
    v-bind="$data"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import rules from '@/components/DataForm/rules'
import {
  UserAssetAccountFieldInitial,
  afterGetFormValueForHandleUserAssetAccount,
  cleanFormValueForHandleUserAssetAccount
} from '../../common'

export default {
  name: 'CommandFilterAclCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        is_active: true,
        ...UserAssetAccountFieldInitial
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
          fields: ['username_group']
        },
        assets: {
          fields: ['name_group', 'address_group']
        },
        accounts: {
          fields: ['username_group']
        },
        priority: {
          // helpText: '优先级可选范围为1-100，1最低优先级，100最高优先级'
          // helpText: this.$t('assets.CommandFilterRulePriorityHelpText')
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
      afterGetFormValue: afterGetFormValueForHandleUserAssetAccount,
      cleanFormValue: cleanFormValueForHandleUserAssetAccount
    }
  }
}
</script>

<style scoped>

</style>
