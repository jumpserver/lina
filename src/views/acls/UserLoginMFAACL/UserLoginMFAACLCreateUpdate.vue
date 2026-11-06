<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { WeekCronSelect } from '@/components/Form/FormFields'
import { Required } from '@/components/Form/DataForm/rules'
import { userJSONSelectMeta } from '@/views/users/const'

export default {
  name: 'UserLoginMFAACLCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        action: 'accept',
        mfa_type: 'otp',
        user: this.$route.query.user,
        users: {
          username_group: ''
        },
        rules: {
          ip_group: ['*']
        }
      },
      url: '/api/v1/acls/login-mfa-acls/',
      hasDetailInMsg: false,
      fields: [
        [this.$t('Basic'), ['name', 'priority']],
        [this.$t('Users'), ['users']],
        [this.$t('Rules'), ['rules']],
        [this.$t('Action'), ['mfa_type', 'action']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        is_active: {
          type: 'checkbox'
        },
        users: userJSONSelectMeta(this, true),
        mfa_type: {
          type: 'select',
          label: this.$t('MFAType'),
          rules: [Required]
        },
        rules: {
          fields: ['ip_group', 'time_period'],
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
        let url = `/api/v1/acls/login-mfa-acls/`
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
        return value
      }
    }
  }
}
</script>
