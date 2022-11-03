<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import getFields from '@/views/accounts/AccountBackupPlan/fields'

export default {
  name: 'AccountBackupPlanUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    const fields = getFields.bind(this)()
    return {
      url: '/api/v1/assets/account-backup-plans/',
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('xpack.AccountBackupPlan.Types'), ['categories']],
        [this.$t('xpack.AccountBackupPlan.Backup'), ['recipients']],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['comment']]
      ],
      initial: {
        is_periodic: true,
        interval: 24,
        categories: []
      },
      fieldsMeta: {
        is_periodic: fields.is_periodic,
        crontab: fields.crontab,
        interval: fields.interval,
        recipients: fields.recipients,
        categories: {
          component: 'el-cascader',
          label: this.$t('xpack.AccountBackupPlan.Types'),
          remote: {
            request: () => vm.$axios.get('/api/v1/assets/categories/')
          },
          el: {
            options: [],
            showAllLevels: false,
            props: {
              multiple: true,
              emitPath: false,
              children: 'types'
            },
            style: {
              width: '100%'
            }
          }
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
