<template>
  <el-row :gutter="20">
    <el-col :md="12" :sm="24">
      <TimelineCard :title="accountTitle" :url="accountUrl" />
    </el-col>
    <el-col :md="12" :sm="24">
      <TimelineCard :title="accountChangeTitle" :url="accountChangeUrl" />
    </el-col>
  </el-row>
</template>

<script>
import TimelineCard from '@/components/TimelineCard'

export default {
  name: 'AssetActivity',
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
      accountUrl: `/api/v1/audits/activities/?resource=operate_log&resource_id=${this.object.id}`,
      accountTitle: `${this.$t('common.Activity')} - ${this.$t('assets.AccountDetail')} (${this.$t('common.Last8')})`,
      accountChangeUrl: `/api/v1/audits/activities/?resource=auth_change&resource_id=${this.object.id}`,
      accountChangeTitle: `${this.$t('common.Activity')} - ${this.$t('xpack.ChangeAuthPlan.ChangeAuthPlan')} (${this.$t('common.Last8')})`
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
