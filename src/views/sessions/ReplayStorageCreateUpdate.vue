<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :create-success-next-route="successUrl"
    :update-success-next-route="successUrl"
    :has-detail-in-msg="false"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { STORAGE_TYPE_META_MAP } from './const'

export default {
  name: 'ReplayStorageUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const storageType = this.$route.query.type || 's3'
    const storageTypeMeta = STORAGE_TYPE_META_MAP[storageType]
    return {
      successUrl: { name: 'Storage', params: { activeMenu: 'RelayStorage' }},
      url: `/api/v1/terminal/replay-storages/`,
      initial: {
        type: storageType,
        endpoint_suffix: 'core.chinacloudapi.cn',
        protocol: 'http'
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
          fields: storageTypeMeta.meta
        },
        is_default: {
          helpText: this.$t('sessions.SetToDefaultStorage')
        }
      }
    }
  },
  computed: {

  },
  mounted() {

  },
  methods: {
  }
}
</script>

<style scoped>

</style>
