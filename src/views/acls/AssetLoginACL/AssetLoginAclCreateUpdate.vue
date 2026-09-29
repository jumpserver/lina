<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import rules from '@/components/Form/DataForm/rules'
import { ResourceSelect, TagInput, WeekCronSelect } from '@/components/Form/FormFields'
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import InputWithUnit from '@/components/Form/FormFields/InputWithUnit.vue'
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
        review_duration: 0,
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
        [this.$t('Action'), ['action', 'reviewers', 'review_duration']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        review_duration: {
          label: this.$t('ReviewExemptionDuration'),
          component: InputWithUnit,
          hidden: (formValue) => formValue.action !== 'review',
          helpText: this.$t('ReviewExemptionDurationHelp'),
          el: { unit: 'hour', type: 'number', min: 0, max: 2147483647, step: 1 },
          rules: [
            {
              validator: (rule, value, callback) => {
                const hours = Number(value)
                if (
                  value === '' ||
                  value == null ||
                  !Number.isInteger(hours) ||
                  hours < 0 ||
                  hours > 2147483647
                ) {
                  return callback(new Error(this.$t('ReviewExemptionDurationInvalid')))
                }
                callback()
              },
              trigger: ['blur', 'change']
            }
          ]
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
            return !['review', 'notice'].includes(formValue.action)
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
        value.review_duration = value.action === 'review' ? Number(value.review_duration) : 0
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
