<template>
  <IBox :title="title" v-bind="$attrs" class="block">
    <el-timeline>
      <el-timeline-item
        v-for="(activity, index) in activities"
        :key="index"
        :icon="activity.icon"
        :color="activity.color"
        :size="activity.size"
        :timestamp="activity.timestamp"
        type="primary"
        placement="top"
      >
        {{ activity.content }}
      </el-timeline-item>
    </el-timeline>
    <div v-if="activities.length < 1">
      {{ this.$t('common.NoContent') }}
    </div>
  </IBox>
</template>

<script>
import IBox from '@/components/IBox'
export default {
  name: 'TimelineCard',
  components: {
    IBox
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    activities: {
      type: Array,
      default: () => []
    },
    url: {
      type: String,
      default: ''
    }
  },
  mounted() {
    if (this.url) {
      this.$axios.get(this.url).then(res => {
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
