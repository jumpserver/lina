<template>
  <div>
    <TwoCol>
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
              {{ $tc('Detail') }}
            </el-link>
          </el-timeline-item>
        </el-timeline>
      </IBox>
    </TwoCol>
    <DiffDetail ref="DetailDialog" :title="$tc('OperateLog')" />
  </div>
</template>

<script lang="jsx">
import IBox from '@/components/Common/IBox/index.vue'
import DiffDetail from '@/components/Dialog/DiffDetail.vue'
import { openTaskPage } from '@/utils/jms/index'
import { toSafeLocalDateStr } from '@/utils/common/time'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'ResourceActivity',
  components: {
    TwoCol,
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
      title: `${this.$t('Last30')}`,
      activities: [
        {
          content: this.$t('Now'),
          timestamp: toSafeLocalDateStr(this.$moment()),
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
        const activities = res || []
        activities.forEach(activity => {
          activity.timestamp = toSafeLocalDateStr(activity.timestamp)
          this.activities.push(activity)
        })
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
