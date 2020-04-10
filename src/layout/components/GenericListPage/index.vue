<template>
  <Page>
    <el-alert v-if="helpMessage" type="success"> {{ helpMessage }} </el-alert>
    <ListTable :table-config="tableConfig" :header-actions="headerActions" />
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import ListTable from '@/components/ListTable'
export default {
  name: 'GenericListPage',
  components: {
    Page, ListTable
  },
  props: {
    ...ListTable.props,
    helpMessage: {
      type: String,
      default: null
    }
  }

}
</script>

<style scoped>

</style>
