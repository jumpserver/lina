<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import getFields from '@/views/accounts/AccountBackupPlan/fields'
import FormTypeField from './components/FormTypeField'

export default {
  name: 'AccountBackupPlanUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const fields = getFields.bind(this)()
    return {
      url: '/api/v1/assets/account-backup-plans/',
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('xpack.AccountBackupPlan.Types'), ['types']],
        [this.$t('xpack.AccountBackupPlan.Backup'), ['recipients']],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['comment']]
      ],
      initial: {
        is_periodic: true,
        interval: 24,
        types: ['all', 'asset', 'application']
      },
      fieldsMeta: {
        is_periodic: fields.is_periodic,
        crontab: fields.crontab,
        interval: fields.interval,
        recipients: fields.recipients,
        types: {
          label: this.$t('xpack.AccountBackupPlan.Types'),
          component: FormTypeField
        }
      },
      createSuccessNextRoute: { name: 'AccountBackupPlanIndex' },
      updateSuccessNextRoute: { name: 'AccountBackupPlanIndex' },
      cleanFormValue(data) {
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
