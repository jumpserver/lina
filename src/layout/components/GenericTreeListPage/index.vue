<template>
  <Page>
    <el-alert v-if="helpMessage" type="success"> {{ helpMessage }} </el-alert>
    <TreeTable :table-config="tableConfig" :header-actions="headerActions" />
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import TreeTable from '@/components/TreeTable'
export default {
  name: 'GenericTreeListPage',
  components: {
    Page, TreeTable
  },
  props: {
    ...TreeTable.props,
    helpMessage: {
      type: String,
      default: null
    }
  }

}
</script>

<style scoped>

</style>
