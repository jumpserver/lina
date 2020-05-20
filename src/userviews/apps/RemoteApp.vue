<template>
  <Page>
    <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
  </Page>

</template>

<script>
import ListTable from '@/components/ListTable/index'
import Page from '@/layout/components/Page/index'
import { ConnectFormatter } from '@/components/ListTable/formatters'

export default {
  name: 'RemoteApp',
  components: {
    ListTable,
    Page
  },
  props: {
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/perms/users/remote-apps/`,
        columns: [
          {
            prop: 'name',
            align: 'center',
            label: this.$t('assets.Name'),
            sortable: true
          },
          {
            prop: 'get_type_display',
            align: 'center',
            label: this.$t('assets.RemoteType')
          },
          {
            prop: 'asset_info.hostname',
            align: 'center',
            label: this.$t('assets.Asset')
          },
          {
            prop: 'comment',
            align: 'center',
            label: this.$t('assets.Comment')
          },
          {
            prop: 'id',
            align: 'center',
            label: this.$t('assets.Action'),
            formatter: ConnectFormatter,
            actions: {
              hasDelete: false,
              onUpdate: function({ row, col, cellValue, reload }) {
                window.open(`/luna/?type=remote_app&login_to=${cellValue}`, '_blank')
              }
            }
          }
        ]
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: false,
        hasSearch: true,
        hasRightActions: false
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

<style lang='less' scoped>

</style>
