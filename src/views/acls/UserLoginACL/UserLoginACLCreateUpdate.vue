<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2'
import {
  approvalActionMeta,
  approvalFormValue,
  cleanApprovalFormValue
} from '@/views/acls/approval'
import { Required, RequiredChange } from '@/components/Form/DataForm/rules'
import { ResourceSelect, TagInput, WeekCronSelect } from '@/components/Form/FormFields'
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { userJSONSelectMeta } from '@/views/users/const'

export default {
  name: 'ACLCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        action: 'reject',
        user: this.$route.query.user,
        users: {
          username_group: ''
        },
        rules: {
          ip_group: ['*']
        }
      },
      url: '/api/v1/acls/login-acls/',
      hasDetailInMsg: false,
      fields: [
        [this.$t('Basic'), ['name', 'priority']],
        [this.$t('Users'), ['users']],
        [this.$t('Rules'), ['rules']],
        [this.$t('Action'), ['action', 'workflow', 'reviewers']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      afterGetFormValue: approvalFormValue,
      afterGetRemoteMeta: (meta) => approvalActionMeta(meta, this.$t),
      fieldsMeta: {
        workflow: {
          component: Select2,
          label: this.$t('WFWorkflows'),
          rules: [RequiredChange],
          hidden: (value) => value.action !== 'workflow_review',
          el: {
            multiple: false,
            clearable: true,
            ajax: {
              url: `/api/v1/tickets/workflows/options/?type=login_confirm&org_id=00000000-0000-0000-0000-000000000000`,
              transformOption: (w) => ({ label: w.name, value: w.id })
            }
          }
        },
        is_active: {
          type: 'checkbox'
        },
        users: userJSONSelectMeta(this, true),
        reviewers: {
          type: 'resourceSelect',
          component: ResourceSelect,
          el: {
            value: [],
            url: '/api/v1/users/users/?fields_size=mini&all=true',
            resourceName: this.$t('Users')
          },
          rules: [Required],
          hidden: (formValue, field) => {
            field.label = this.$t(formValue.action === 'review' ? 'Reviewer' : 'Recipients')
            return !['review', 'notice'].includes(formValue.action)
          }
        },
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
        }
      },
      getUrl() {
        const query = this.$route.query
        const params = this.$route.params
        let url = `/api/v1/acls/login-acls/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        if (query.user) {
          url = `${url}?user=${query.user}`
        }
        return url
      },
      cleanFormValue(value) {
        cleanApprovalFormValue(value)
        if (
          Array.isArray(value.rules.time_period) &&
          value.rules.time_period.every((item) => item.value === '')
        ) {
          value.rules.time_period = []
        }

        if (!Array.isArray(value.rules.ip_group)) {
          value.rules.ip_group = value.rules.ip_group ? value.rules.ip_group.split(',') : []
        }
        if (!['review', 'notice'].includes(value.action)) {
          value.reviewers = []
        }
        return value
      }
    }
  }
}
</script>
