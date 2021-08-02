<template>
  <GenericCreateUpdatePage v-bind="$data" :clean-form-value="cleanFormValue" :create-success-next-route="createUpdateSuccessNextRoute" :update-success-next-route="createUpdateSuccessNextRoute" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import getFields from '@/views/accounts/ChangeAuthPlan/fields'

export default {
  name: 'ChangeDatabaseAuthPlanCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const fields = getFields.bind(this)()
    return {
      url: '/api/v1/xpack/change-auth-plan/plan/?action=database',
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('xpack.Asset'), ['database', 'systemuser']],
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
        password_rules: fields.password_rules,
        is_periodic: fields.is_periodic,
        crontab: fields.crontab,
        interval: fields.interval
      },
      createUpdateSuccessNextRoute: {
        name: 'ChangeAuthPlanList'
      }
    }
  },
  methods: {
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
</script>

<style scoped>

</style>
