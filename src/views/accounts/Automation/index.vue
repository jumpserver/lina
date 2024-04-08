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
        url: '/api/v1/terminal/applets/',
        deletePerm: 'terminal.delete_applet'
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
