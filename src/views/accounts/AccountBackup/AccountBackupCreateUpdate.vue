<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import getChangeSecretFields from '@/views/accounts/AccountBackup/fields'

export default {
  name: 'AccountBackupPlanUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    const fields = getChangeSecretFields.bind(this)()
    return {
      url: '/api/v1/accounts/account-backup-plans/',
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('accounts.AccountBackup.Types'), ['types']],
        [this.$t('accounts.AccountBackup.Backup'), ['recipients_part_one', 'recipients_part_two']],
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
        recipients_part_one: fields.recipients_part_one,
        recipients_part_two: fields.recipients_part_two,
        types: {
          component: 'el-cascader',
          label: this.$t('accounts.AccountBackup.Types'),
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
      createSuccessNextRoute: { name: 'AccountBackupList' },
      updateSuccessNextRoute: { name: 'AccountBackupList' },
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
