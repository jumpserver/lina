<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import getFields from '@/views/accounts/ChangeAuthPlan/fields'

export default {
  name: 'DatabaseChangeAuthPlanCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const fields = getFields.bind(this)()
    return {
      url: '/api/v1/xpack/change-auth-plan/database-plan/',
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('xpack.Database'), ['database', 'systemuser']],
        [this.$t('xpack.ChangeAuthPlan.PasswordStrategy'), ['password_strategy', 'password', 'password_rules']],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['comment']]
      ],
      initial: {
        password_strategy: 'custom',
        is_periodic: true,
        password_rules: {
          length: 30
        },
        interval: 24
      },
      fieldsMeta: {
        database: fields.database,
        systemuser: fields.systemuser,
        password: fields.password,
        password_rules: fields.database_password_rules,
        is_periodic: fields.is_periodic,
        password_strategy: fields.password_strategy,
        crontab: fields.crontab,
        interval: fields.interval
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
