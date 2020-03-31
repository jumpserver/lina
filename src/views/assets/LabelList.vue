<template>
  <Page>
    <template slot="content">
      <el-alert type="success"> 这里是一个成功的文案 </el-alert>
      <el-card>
        <tables v-bind="tableConfig" />
      </el-card>
    </template>
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import Tables from '@/components/ListTable/index'
import { getLabelList } from '@/api/asset'
export default {
  components: {
    Page,
    Tables
  },
  data() {
    return {
      tableConfig: {
        getData: getLabelList,
        hasSelect: true,
        columns: [
          {
            prop: 'name',
            label: this.$t('common.name'),
            key: 'name',
            link: 'LabelDetail',
            sortable: true
          },
          {
            prop: 'value',
            label: this.$t('assets.value'),
            key: 'value'
          },
          {
            prop: 'asset',
            label: this.$t('assets.asset'),
            key: 'asset_count'
          },
          {
            prop: 'comment',
            label: this.$t('assets.comment'),
            key: 'comment'
          }
        ],
        action: {
          hasEdit: 'LabelEdit',
          newClick: 'LabelEdit'
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
