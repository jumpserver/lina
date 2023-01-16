<template>
  <el-row :gutter="20">
    <el-col :md="12" :sm="24">
      <TimelineCard :title="activityTitle" :url="activityUrl" />
    </el-col>
  </el-row>
</template>

<script>
import TimelineCard from '@/components/TimelineCard'

export default {
  name: 'UserActivity',
  components: {
    TimelineCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      activityUrl: `/api/v1/audits/activities/?resource_id=${this.object.id}`,
      activityTitle: `${this.$t('common.Activity')} - ${this.$t('audits.OperateRecord')} (${this.$t('common.Last30')})`
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
