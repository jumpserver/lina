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
import Select2 from '@/components/Form/FormFields/Select2'
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
      cleanFormValue(value) {
        value.workflow = value.action === 'review' ? value.workflow || null : null
        return value
      },
      initial: {
        is_active: true,
        accounts: ['@ALL'],
        command_groups: []
      },
      fields: [
        [this.$t('BasicInfo'), ['name', 'priority']],
        [this.$t('EffectiveScope'), ['users', 'assets', 'accounts']],
        [this.$t('CommandMatching'), ['command_groups']],
        [this.$t('Action'), ['action', 'workflow', 'reviewers']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      url: '/api/v1/acls/command-filter-acls/',
      createSuccessNextRoute: { name: 'CommandFilterACLList' },
      fieldsMeta: {
        workflow: {
          component: Select2,
          label: this.$t('WFWorkflows'),
          helpText: this.$t('WFACLHint'),
          hidden: (value) => value.action !== 'review',
          el: {
            multiple: false,
            clearable: true,
            ajax: {
              url: `/api/v1/tickets/workflows/options/?type=command_confirm&org_id=${this.$store.getters.currentOrg.id}`,
              transformOption: (w) => ({ label: w.name, value: w.id })
            }
          }
        },
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
          hidden: (item) =>
            !['review', 'warning', 'notify_and_warn'].includes(item.action) ||
            (item.action === 'review' && !!item.workflow),
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
