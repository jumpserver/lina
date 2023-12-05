<template>
  <GenericCreateUpdatePage
    :create-success-next-route="successUrl"
    :update-success-next-route="successUrl"
    v-bind="$data"
    :help-message="getHelpMessage()"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { STORAGE_TYPE_META_MAP } from '@/views/sessions/const'
import { UploadSecret } from '@/components/Form/FormFields'
import { encryptPassword } from '@/utils/crypto'

export default {
  name: 'ReplayStorageUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const storageType = this.$route.query.type || 's3'
    const storageTypeMeta = STORAGE_TYPE_META_MAP[storageType] || {}
    return {
      successUrl: { name: 'Storage', params: { activeMenu: 'RelayStorage' }},
      url: `/api/v1/terminal/replay-storages/`,
      initial: {
        type: storageType,
        endpoint_suffix: 'core.chinacloudapi.cn',
        protocol: 'http',
        is_default: true
      },
      getUrl() {
        const params = this.$route.params
        let url = `/api/v1/terminal/replay-storages/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return `${url}?type=${storageType}`
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'type']],
        [storageTypeMeta.title, ['meta']],
        [this.$t('common.Other'), ['is_default', 'comment']]
      ],
      fieldsMeta: {
        type: {
          disabled: true
        },
        meta: {
          fields: storageTypeMeta.meta,
          fieldsMeta: {
            SFTP_PASSWORD: {
              hidden: (formValue) => formValue.STP_SECRET_TYPE !== 'password'
            },
            STP_PRIVATE_KEY: {
              component: UploadSecret,
              hidden: (formValue) => formValue.STP_SECRET_TYPE !== 'ssh_key'
            },
            STP_PASSPHRASE: {
              hidden: (formValue) => formValue.STP_SECRET_TYPE !== 'ssh_key'
            }
          }
        },
        is_default: {
          helpText: this.$t('sessions.SetToDefaultStorage'),
          hidden: (formValue) => formValue.type === 'sftp'
        }
      },
      cleanFormValue(values) {
        const encryptedFields = ['SFTP_PASSWORD', 'STP_PASSPHRASE', 'SECRET_KEY', 'ACCOUNT_KEY']
        const meta = values.meta
        for (const item of encryptedFields) {
          const val = meta[item]
          if (val) {
            meta[item] = encryptPassword(val)
          }
        }
        return values
      }
    }
  },
  mounted() {
    if (this.$route.query.type === 'sftp' && !this.$hasLicense()) this.$router.push({ name: '404' })
  },
  methods: {
    getHelpMessage() { if (!this.$hasLicense()) return ''; else return this.$t('setting.ReplayStorageCreateUpdateHelpMessage') }
  }
}
</script>

<style scoped>

</style>
