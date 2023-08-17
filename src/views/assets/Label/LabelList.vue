<template>
  <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/labels/',
        columnsExclude: ['category'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'value', 'assets', 'date_created',
            'comment', 'org_name', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: null
          },
          assets: {
            label: this.$t('assets.Assets'),
            width: '160px',
            type: '-',
            formatter: AmountFormatter,
            formatterArgs: {
              can: false
            }
          }
        }
      },
      headerActions: {
        createRoute: 'LabelCreate'
      }
    }
  }
}
</script>

<style>

</style>
