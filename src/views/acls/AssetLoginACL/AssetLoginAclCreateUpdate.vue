<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import rules from '@/components/Form/DataForm/rules'
import Select2 from '@/components/Form/FormFields/Select2'
import { ResourceSelect, TagInput, WeekCronSelect } from '@/components/Form/FormFields'
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { assetJSONSelectMeta } from '@/views/assets/const'
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter.vue'
import { userJSONSelectMeta } from '@/views/users/const'

export default {
  name: 'ACLCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        accounts: ['@ALL'],
        rules: {
          ip_group: ['*']
        }
      },
      fields: [
        [this.$t('Basic'), ['name', 'priority']],
        [this.$t('Users'), ['users']],
        [this.$t('Asset'), ['assets']],
        [this.$t('Accounts'), ['accounts']],
        [this.$t('Rules'), ['rules']],
        [this.$t('Action'), ['action', 'workflow', 'reviewers']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
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
              url: `/api/v1/tickets/workflows/options/?type=login_asset_confirm&org_id=${this.$store.getters.currentOrg.id}`,
              transformOption: (w) => ({ label: w.name, value: w.id })
            }
          }
        },
        priority: {
          rules: [rules.Required]
        },
        assets: assetJSONSelectMeta(this),
        rules: {
          fields: ['ip_group', 'time_period'],
          fieldsMeta: {
            ip_group: {
              component: TagInput,
              el: {
                value: ['*'],
                placeholder: this.$t('IP')
              },
              helpText: this.$t('IpGroupHelpText')
            },
            time_period: {
              component: WeekCronSelect
            }
          }
        },
        users: userJSONSelectMeta(this),
        accounts: {
          component: AccountFormatter,
          el: {
            showAddTemplate: false,
            enableVirtualAccount: false,
            value: ['@ALL'],
            assets: []
          },
          hidden: (formValue) => {
            const ids = formValue.assets?.ids
            this.fieldsMeta.accounts.el.assets = ids || []
          }
        },
        reviewers: {
          type: 'resourceSelect',
          component: ResourceSelect,
          hidden: (formValue) => {
            return (
              !['review', 'notice'].includes(formValue.action) ||
              (formValue.action === 'review' && !!formValue.workflow)
            )
          },
          rules: [rules.RequiredChange],
          el: {
            value: [],
            url: '/api/v1/users/users/?fields_size=mini',
            resourceName: this.$t('Users')
          }
        }
      },
      url: '/api/v1/acls/login-asset-acls/',
      cleanFormValue(value) {
        value.workflow = value.action === 'review' ? value.workflow || null : null
        if (!Array.isArray(value.rules.ip_group)) {
          value.rules.ip_group = value.rules.ip_group ? value.rules.ip_group.split(',') : []
        }
        if (!['review', 'notice'].includes(value.action)) {
          value.reviewers = []
        }
        return value
      }
    }
  },
  methods: {}
}
</script>

<style></style>
