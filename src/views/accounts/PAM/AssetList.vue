<template>
  <BaseList
    :header-actions="headerActions"
    :table-config="tableConfig"
    v-bind="config"
  />
</template>

<script>
import BaseList from '@/views/assets/Asset/AssetList/components/BaseList.vue'

export default {
  components: {
    BaseList
  },
  data() {
    return {
      config: {
        url: '/api/v1/assets/assets/',
        category: 'all'
      },
      tableConfig: {
        columnsExclude: ['date_verified']
      },
      headerActions: {
        handleImportClick: ({ selectedRows }) => {
          this.$message.warning({
            message: this.$t('ImportMessage')
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .ibox {
  height: 100%;

  .el-card__body {
    height: 100%;
  }
}

::v-deep .page, .page.tab-page {
  .page-heading .el-row--flex {
    flex-wrap: wrap;

    .page-heading-left .el-button {
      display: none;
    }
  }
}
</style>
