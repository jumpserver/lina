<template>
  <el-row :gutter="20">
    <el-col :md="12" :sm="24">
      <IBox :title="title" class="block" v-bind="$attrs">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :size="activity.size"
            :timestamp="activity.timestamp"
            :type="activity.type"
            placement="bottom"
          >
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
        <div v-if="activities.length < 1">
          {{ this.$t('common.NoContent') }}
        </div>
      </IBox>
    </el-col>
  </el-row>
</template>

<script>
import IBox from '@/components/IBox'

export default {
  name: 'AccountActivity',
  components: {
    IBox
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      activityUrl: `/api/v1/audits/activities/?resource_id=${this.object.id}`,
      title: `${this.$t('common.Activity')} - ${this.$t('common.Last30')}`,
      activities: [
        {
          content: this.$t('common.Now'),
          timestamp: this.$moment().format('YYYY-MM-DD HH:mm:ss'),
          type: 'primary'
        }
      ]
    }
  },
  mounted() {
    this.getActivities()
  },
  methods: {
    getActivities() {
      this.$axios.get(this.activityUrl).then(res => {
        for (const i in res) {
          this.activities.push(res[i])
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
