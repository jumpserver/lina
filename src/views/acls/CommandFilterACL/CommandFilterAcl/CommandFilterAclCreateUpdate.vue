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
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter.vue'
import rules from '@/components/Form/DataForm/rules'
import { userJSONSelectMeta } from '@/views/users/const'
import { assetJSONSelectMeta } from '@/views/assets/const'

export default {
  name: 'CommandFilterACLCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        is_active: true,
        accounts: ['@ALL']
      },
      fields: [
        [this.$t('Basic'), ['name', 'priority']],
        [this.$t('User'), ['users']],
        [this.$t('Asset'), ['assets']],
        [this.$t('Account'), ['accounts']],
        [this.$t('CommandGroup'), ['command_groups']],
        [this.$t('Action'), ['action', 'reviewers']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      url: '/api/v1/acls/command-filter-acls/',
      createSuccessNextRoute: { name: 'CommandFilterACLList' },
      fieldsMeta: {
        users: userJSONSelectMeta(this),
        assets: assetJSONSelectMeta(this),
        accounts: {
          component: AccountFormatter,
          el: {
            showAddTemplate: false,
            showVirtualAccount: false
          }
        },
        action: {},
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
          hidden: (item) => !['review', 'warning', 'notify_and_warn'].includes(item.action),
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
      }
    }
  }
}
</script>

<style scoped>

</style>
