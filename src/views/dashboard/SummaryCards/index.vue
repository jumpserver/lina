<template>
  <el-row :gutter="30">
    <el-col v-for="item in items" :key="item.title" :span="6">
      <SummaryCard :title="item.title" :label="item.label" :total-count="item.totalCount" />
    </el-col>
  </el-row>
</template>

<script>
import SummaryCard from './SummaryCard'

export default {
  name: 'SummaryCards',
  components: {
    SummaryCard
  },
  props: {
    items: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>

</style>
