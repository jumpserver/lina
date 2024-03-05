<template>
  <el-row :gutter="20">
    <el-col :md="16" :sm="24">
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
      return this.object.meta.comment ? this.object.meta.comment : this.object.name
    },
    detailCardItems() {
      return [
        {
          key: this.$t('Name'),
          value: this.object.name
        },
        {
          key: this.$t('Comment'),
          value: this.object.meta.comment
        },
        {
          key: this.$t('Queue'),
          value: this.object.meta.queue
        },
        {
          key: this.$t('LastPublishedTime'),
          value: this.object.last_published_time
        }
      ]
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
