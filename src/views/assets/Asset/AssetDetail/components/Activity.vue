<template>
  <el-row :gutter="20">
    <el-col :md="12" :sm="24">
      <TimelineCard :title="assetTitle" :url="assetUrl" />
    </el-col>
    <el-col :md="12" :sm="24">
      <TimelineCard :title="sessionTitle" :url="sessionUrl" />
    </el-col>
  </el-row>
</template>

<script>
import TimelineCard from '@/components/TimelineCard'

export default {
  name: 'AccountActivity',
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
      assetUrl: `/api/v1/audits/activities/?resource=operate_log&resource_id=${this.object.id}`,
      sessionUrl: `/api/v1/audits/activities/?resource=session&resource_id=${this.object.id}`,
      sessionTitle: `${this.$t('common.Activity')} - ${this.$t('dashboard.SessionData')} (${this.$t('common.Last8')})`,
      assetTitle: `${this.$t('common.Activity')} - ${this.$t('assets.AssetDetail')} (${this.$t('common.Last8')})`
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
