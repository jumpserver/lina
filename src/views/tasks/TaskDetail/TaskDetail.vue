<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
  </el-row>
</template>

<script type="text/jsx">
import DetailCard from '@/components/DetailCard'

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
      return this.object.name
    },
    detailCardItems() {
      return [
        {
          key: this.$t('common.Name'),
          value: this.object.name
        }
      ]
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
