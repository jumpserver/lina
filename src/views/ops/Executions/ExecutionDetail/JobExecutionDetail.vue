<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailCardItems" />
    </el-col>
  </el-row>
</template>

<script type="text/jsx">
import DetailCard from '@/components/DetailCard'

export default {
  components: {
    DetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: 'ID',
          value: this.object.id
        },
        {
          key: '类型',
          value: this.object.job_type
        },
        {
          key: '完成',
          value: this.object.is_finished
        },
        {
          key: '成功',
          value: this.object.is_success
        },
        {
          key: '创建时间',
          value: this.object.date_created
        },
        {
          key: '开始时间',
          value: this.object.date_start
        },
        {
          key: '完成时间',
          value: this.object.date_finished
        }
      ]
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
