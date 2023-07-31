<template>
  <GenericCreateUpdatePage
    :create-success-next-route="successUrl"
    :update-success-next-route="successUrl"
    v-bind="$data"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { STORAGE_TYPE_META_MAP } from '@/views/sessions/const'
import { UpdateToken } from '@/components/Form/FormFields'
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
      successUrl: { name: 'TerminalSetting', params: { activeMenu: 'RelayStorage' }},
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
            SECRET_KEY: {
              component: UpdateToken
            }
          }
        },
        is_default: {
          helpText: this.$t('sessions.SetToDefaultStorage')
        }
      },
      cleanFormValue(values) {
        const encryptedFields = ['SECRET_KEY', 'ACCOUNT_KEY']
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
  }
}
</script>

<style scoped>

</style>
