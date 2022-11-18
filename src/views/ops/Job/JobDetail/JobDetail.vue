<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
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
    cardTitle() {
      return this.object.name
    },
    detailCardItems() {
      return [
        {
          key: this.$t('common.Name'),
          value: this.object.name
        },
        {
          key: this.$t('ops.JobType'),
          value: this.object.type
        },
        {
          key: this.$t('ops.Comment'),
          value: this.object.comment
        },
        {
          key: this.$t('ops.AverageTimeCost'),
          value: this.object.average_time_cost.toFixed(2) + 's'
        },
        {
          key: this.$t('ops.DateLastRun'),
          value: this.object.date_last_run
        },
        {
          key: this.$t('common.DateUpdated'),
          value: this.object.date_updated
        },
        {
          key: this.$t('common.DateCreated'),
          value: this.object.date_created
        }
      ]
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
