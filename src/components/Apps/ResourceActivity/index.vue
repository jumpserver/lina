<template>
  <div>
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
              <el-link
                v-if="activity['detail_url']"
                type="primary"
                @click.native="onClick(activity)"
              >
                {{ $tc('common.Detail') }}
              </el-link>
            </el-timeline-item>
          </el-timeline>
        </IBox>
      </el-col>
    </el-row>
    <DiffDetail ref="DetailDialog" :title="$tc('route.OperateLog')" />
  </div>
</template>

<script>
import IBox from '@/components/IBox/index.vue'
import DiffDetail from '@/components/Dialog/DiffDetail.vue'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'ResourceActivity',
  components: {
    IBox,
    DiffDetail
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
    },
    onClick(activity) {
      const type = activity['r_type']
      const taskUrl = activity['detail_url']
      if (type === 'O') {
        this.$axios.get(taskUrl).then(
          res => {
            this.$refs.DetailDialog.show(res.diff)
          }
        )
      } else {
        openTaskPage('', 'celery', taskUrl)
      }
    }
  }
}
</script>

<style scoped>

</style>
