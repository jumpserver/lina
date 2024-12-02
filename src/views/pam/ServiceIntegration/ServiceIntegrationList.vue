<template>
  <div>
    <SmallCard ref="table" v-bind="$data" />
  </div>
</template>

<script type="text/jsx">
import SmallCard from '@/components/Table/CardTable/SmallCard.vue'
import { toSafeLocalDateStr } from '@/utils/time'

export default {
  name: 'CloudAccountList',
  components: {
    SmallCard
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/accounts/service-integrations/',
        permissions: { app: 'accounts', resource: 'serviceintegration' }
      },
      headerActions: {
        hasImport: false,
        hasExport: false,
        hasColumnSetting: false,
        hasMoreActions: false,
        searchConfig: {
          getUrlQuery: false
        }
      },
      subComponentProps: {
        getImage: (obj) => {
          return obj.logo_image
        },
        getInfos: (obj) => {
          return [
            { title: `${this.$tc('RelevantApp')} ID`, content: obj.id },
            { title: this.$tc('DataLastUsed'), content: toSafeLocalDateStr(obj.date_last_used) },
            { title: this.$tc('AccountAmount'), content: obj.accounts_amount },
            { title: this.$tc('Comment'), content: obj.comment || this.$tc('Nothing') }
          ]
        },
        handleUpdate: (obj) => {
          this.$router.push({ name: 'ServiceIntegrationUpdate', params: { id: obj.id }})
        }
      }
    }
  },
  methods: {}
}
</script>
