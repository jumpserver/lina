<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { WeekCronSelect } from '@/components/Form/FormFields'
import { Required } from '@/components/Form/DataForm/rules'
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
        [this.$t('Action'), ['action', 'reviewers']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        is_active: {
          type: 'checkbox'
        },
        users: userJSONSelectMeta(this, true),
        reviewers: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/users/users/?fields_size=mini&all=true',
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
          },
          rules: [Required],
          hidden: (formValue) => {
            return !['review', 'notice'].includes(formValue.action)
          }
        },
        rules: {
          fields: [
            'ip_group', 'time_period'
          ],
          fieldsMeta: {
            ip_group: {
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
        if (
          Array.isArray(value.rules.time_period) &&
          value.rules.time_period.every(item => item.value === '')
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
