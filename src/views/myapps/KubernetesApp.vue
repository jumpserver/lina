<template>
  <Page>
    <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
  </Page>

</template>

<script>
import ListTable from '@/components/ListTable'
import Page from '@/layout/components/Page'
import { ActionsFormatter } from '@/components/TableFormatters'

export default {
  name: 'KubernetesApp',
  components: {
    ListTable,
    Page
  },
  props: {
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/perms/users/applications/?category=cloud`,
        columns: [
          {
            prop: 'name',
            align: 'center',
            label: this.$t('assets.Name'),
            sortable: true
          },
          {
            prop: 'type_display',
            align: 'center',
            label: this.$t('assets.Type')
          },
          {
            prop: 'attrs.cluster',
            align: 'center',
            label: this.$t('applications.cluster')
          },
          {
            prop: 'comment',
            align: 'center',
            showOverflowTooltip: true,
            label: this.$t('assets.Comment')
          },
          {
            prop: 'id',
            align: 'center',
            label: this.$t('assets.Action'),
            formatter: ActionsFormatter,
            formatterArgs: {
              hasDelete: false,
              hasUpdate: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'connect',
                  fa: 'fa-terminal',
                  type: 'primary',
                  callback: function({ row }) {
                    window.open(`/luna/?type=k8s_app&login_to=${row.id}`, '_blank')
                  }
                }
              ]
            }
          }
        ]
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: false,
        hasSearch: true,
        hasRightActions: true
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
