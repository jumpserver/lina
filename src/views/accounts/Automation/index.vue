<template>
  <Page>
    <CardTable ref="CardTable" v-bind="$data" />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import CardTable from '@/components/Table/CardTable'

export default {
  name: 'Applets',
  components: {
    CardTable,
    Page
  },
  data() {
    return {
      tableConfig: {
        totalData: [
          {
            id: 'abc',
            display_name: '账号推送',
            name: 'Pushing',
            comment: '自动将账号创建在目标资产上',
            icon: 'fa-plus'
          }
        ]
      },
      headerActions: {
        hasLeftActions: false,
        hasRightActions: false,
        detailRoute: 'AppletDetail',
        hasExport: false,
        hasImport: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasColumnSetting: false
      }
    }
  },
  methods: {
    handleUpload(res) {
      this.$refs.CardTable.reloadTable()
    }
  }
}
</script>

<style lang="scss" scoped>
.zone {
  white-space: initial;

  .el-tag {
    margin-right: 3px;
  }
}
</style>
