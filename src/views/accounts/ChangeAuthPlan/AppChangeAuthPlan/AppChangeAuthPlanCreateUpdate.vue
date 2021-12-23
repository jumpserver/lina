<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import getFields from '@/views/accounts/ChangeAuthPlan/fields'

export default {
  name: 'AppChangeAuthPlanCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const fields = getFields.bind(this)()
    return {
      url: '/api/v1/xpack/change-auth-plan/app-plan/',
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('assets.Applications'), ['category', 'type', 'apps', 'system_users']],
        [this.$t('xpack.ChangeAuthPlan.PasswordStrategy'), ['password_strategy', 'password', 'password_rules']],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['recipients', 'comment']]
      ],
      initial: {
        type: this.$route.query.type,
        category: this.$route.query.category,
        password_strategy: 'custom',
        is_periodic: true,
        password_rules: {
          length: 30
        },
        interval: 24
      },
      fieldsMeta: {
        type: {
          type: 'select',
          disabled: true
        },
        category: {
          hidden: () => true
        },
        apps: {
          label: this.$t('assets.Applications'),
          el: {
            value: [],
            ajax: {
              url: `/api/v1/applications/applications/?category=${this.$route.query.category}&type=${this.$route.query.type}`,
              transformOption: (item) => {
                return { label: item.name + ' (' + item.type_display + ')', value: item.id }
              }
            }
          }
        },
        system_users: {
          el: {
            value: [],
            ajax: {
              url: (function() {
                let url = '/api/v1/assets/system-users/'
                const queryType = this.$route.query.type
                if (this.$route.query.category === 'remote_app') {
                  url += `?protocol=rdp`
                } else if (queryType) {
                  url += `?protocol=${queryType}`
                }
                return url
              }.bind(this)()),
              transformOption: (item) => {
                if (this.$route.query.type === 'k8s') {
                  return { label: item.name, value: item.id }
                }
                const username = item.username || '*'
                return { label: item.name + '(' + username + ')', value: item.id }
              }
            }
          }
        },
        password: fields.password,
        password_rules: fields.database_password_rules,
        is_periodic: fields.is_periodic,
        password_strategy: fields.password_strategy,
        crontab: fields.crontab,
        interval: fields.interval,
        recipients: fields.recipients
      },
      createSuccessNextRoute: { name: 'ChangeAuthPlanIndex' },
      updateSuccessNextRoute: { name: 'ChangeAuthPlanIndex' },
      cleanFormValue(data) {
        if (data['password_strategy'] === 'custom') {
          delete data['password_rules']
        } else {
          delete data['password']
        }
        if (data['interval'] === '') {
          delete data['interval']
        }
        return data
      }
    }
  }
}
</script>

<style scoped>

</style>
