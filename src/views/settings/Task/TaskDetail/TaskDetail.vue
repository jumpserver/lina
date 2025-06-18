<template>
  <el-row :gutter="20" class="task-detail">
    <el-col :md="20" :sm="24">
      <DetailCard :items="detailCardItems" :title="cardTitle" />
    </el-col>
  </el-row>
</template>

<script type="text/jsx">
import DetailCard from '@/components/Cards/DetailCard/index.vue'

export default {
  name: 'TaskDetail',
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
      return this.$t('BasicInfo')
    },
    detailCardItems() {
      return [
        {
          key: this.$t('TaskPath'),
          value: this.object.name
        },
        {
          key: this.$t('Name'),
          value: this.object.meta.comment
        },
        {
          key: this.$t('Queue'),
          value: this.object.meta.queue
        },
        {
          key: this.$t('LastPublishedTime'),
          value: this.object.date_last_publish
        },
        {
          key: this.$t('Description'),
          value: this.object.meta.description
        }
      ]
    }
  },
  methods: {}
}
</script>
<style lang="less" scoped>
.task-detail /deep/ .item-value span {
  white-space: normal !important;
}
</style>
