<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import getChangeSecretFields from '@/views/accounts/AccountBackup/fields'
import { encryptPassword } from '@/utils/crypto'
import { periodicMeta } from '@/components/const'

export default {
  name: 'AccountBackupUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    const fields = getChangeSecretFields.bind(this)()
    return {
      url: '/api/v1/accounts/account-backup-plans/',
      fields: [
        [this.$t('Basic'), ['name', 'types']],
        [this.$t('Backup'),
          [
            'backup_type',
            'is_password_divided_by_email',
            'recipients_part_one',
            'recipients_part_two',
            'is_password_divided_by_obj_storage',
            'obj_recipients_part_one',
            'obj_recipients_part_two',
            'zip_encrypt_password'
          ]
        ],
        [this.$t('Periodic'), ['is_periodic', 'interval', 'crontab']],
        [this.$t('Other'), ['comment']]
      ],
      initial: {
        is_periodic: false,
        interval: 24,
        categories: []
      },
      fieldsMeta: {
        ...periodicMeta,
        is_password_divided_by_email: fields.is_password_divided_by_email,
        zip_encrypt_password: fields.zip_encrypt_password,
        is_password_divided_by_obj_storage: fields.is_password_divided_by_obj_storage,
        recipients_part_one: fields.recipients_part_one,
        recipients_part_two: fields.recipients_part_two,
        obj_recipients_part_one: fields.obj_recipients_part_one,
        obj_recipients_part_two: fields.obj_recipients_part_two,
        types: {
          component: 'el-cascader',
          label: this.$t('Types'),
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
        if (data['zip_encrypt_password'] !== '') {
          data['zip_encrypt_password'] = encryptPassword(data['zip_encrypt_password'])
        }
        if (data['interval'] === '') {
          delete data['interval']
        }
        if (!data?.is_password_divided_by_email) {
          data['recipients_part_two'] = []
        }
        if (!data?.is_password_divided_by_obj_storage) {
          data['obj_recipients_part_two'] = []
        }
        return data
      }
    }
  }
}
</script>

<style scoped>

</style>
