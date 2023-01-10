<template>
  <el-row :gutter="20">
    <el-col :md="12" :sm="24">
      <TimelineCard :title="userTitle" :url="userUrl" />
    </el-col>
    <el-col :md="12" :sm="24">
      <TimelineCard :title="userLoginTitle" :url="userLoginUrl" />
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
      userUrl: `/api/v1/audits/activities/?resource=operate_log&resource_id=${this.object.id}`,
      userTitle: `${this.$t('common.Activity')} - ${this.$t('users.Users')} (${this.$t('common.Last8')})`,
      userLoginUrl: `/api/v1/audits/activities/?resource=login&resource_id=${this.object.username}`,
      userLoginTitle: `${this.$t('common.Activity')} - ${this.$t('users.Login')} (${this.$t('common.Last8')})`
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
