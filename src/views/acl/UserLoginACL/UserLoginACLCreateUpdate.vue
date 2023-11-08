<template>
  <GenericCreateUpdateDrawer v-bind="$data" />
</template>

<script>
import GenericCreateUpdateDrawer from '@/layout/components/GenericCreateUpdateDrawer'
import { WeekCronSelect } from '@/components/Form/FormFields'
import { Required } from '@/components/Form/DataForm/rules'
import { userJSONSelectMeta } from '@/views/users/const'

export default {
  name: 'AclCreateUpdate',
  components: {
    GenericCreateUpdateDrawer
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
        [this.$t('common.Basic'), ['name', 'priority']],
        [this.$t('acl.users'), ['users']],
        [this.$t('acl.Rules'), ['rules']],
        [this.$t('acl.Action'), ['action', 'reviewers']],
        [this.$t('common.Other'), ['is_active', 'comment']]
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
              label: this.$t('acl.ip_group'),
              helpText: this.$t('acl.ipGroupHelpText')
            },
            time_period: {
              label: this.$t('common.timePeriod'),
              component: WeekCronSelect
            }
          }
        }
      },
      cleanFormValue(value) {
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
  mounted() {
  },
  methods: {
  }
}
</script>

<style>

</style>
