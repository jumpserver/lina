<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :fields="fields"
    :fields-meta="fieldsMeta"
    :initial="initial"
    :url="url"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter.vue'
import rules from '@/components/Form/DataForm/rules'
import { ResourceSelect } from '@/components/Form/FormFields'
import { userJSONSelectMeta } from '@/views/users/const'
import { assetJSONSelectMeta } from '@/views/assets/const'
import CommandGroupSelect from '../components/CommandGroupSelect.vue'

export default {
  name: 'CommandFilterACLCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        is_active: true,
        accounts: ['@ALL'],
        command_groups: []
      },
      fields: [
        [this.$t('BasicInfo'), ['name', 'priority']],
        [this.$t('EffectiveScope'), ['users', 'assets', 'accounts']],
        [this.$t('CommandMatching'), ['command_groups']],
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
            enableVirtualAccount: false
          }
        },
        action: {},
        command_groups: {
          type: 'resourceSelect',
          label: this.$tc('CommandGroup', 2),
          component: CommandGroupSelect,
          el: {
            value: [],
            url: '/api/v1/acls/command-groups/?fields_size=mini',
            resourceName: this.$tc('CommandGroup', 2)
          }
        },
        reviewers: {
          type: 'resourceSelect',
          component: ResourceSelect,
          hidden: (item) => !['review', 'warning', 'notify_and_warn'].includes(item.action),
          rules: [rules.RequiredChange],
          el: {
            value: [],
            url: '/api/v1/users/users/?fields_size=mini',
            resourceName: this.$t('Users')
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

<style scoped></style>
