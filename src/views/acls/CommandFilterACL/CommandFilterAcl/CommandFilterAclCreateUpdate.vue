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
import {
  approvalActionMeta,
  approvalFormValue,
  cleanApprovalFormValue
} from '@/views/acls/approval'
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
        cleanApprovalFormValue(value)
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
      afterGetFormValue: approvalFormValue,
      afterGetRemoteMeta: (meta) => approvalActionMeta(meta, this.$t),
      fieldsMeta: {
        workflow: {
          component: Select2,
          label: this.$t('WFWorkflows'),
          rules: [rules.RequiredChange],
          hidden: (value) => value.action !== 'workflow_review',
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
        action: {
          type: 'radio-group'
        },
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
          hidden: (item, field) => {
            field.label = this.$t(item.action === 'review' ? 'Reviewer' : 'Recipients')
            return !['review', 'warning', 'notify_and_warn'].includes(item.action)
          },
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
