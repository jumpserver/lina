<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'

export default {
  name: 'ChangeAuthPlanExecutionTaskList',
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {

      },
      headerActions: {
      }
    }
  }
}
</script>

<style scoped>

</style>
