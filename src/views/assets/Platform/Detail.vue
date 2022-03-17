<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :md="10" :sm="24" />
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
export default {
  name: 'Detail',
  components: {
    DetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('assets.Name'),
          value: this.object.name
        },
        {
          key: this.$t('assets.BasePlatform'),
          value: this.object.base
        },
        {
          key: this.$t('assets.Charset'),
          value: this.object.charset
        },
        {
          key: this.$t('assets.Meta'),
          value: JSON.stringify(this.object.meta)
        },
        {
          key: this.$t('assets.Comment'),
          value: this.object.comment
        }
      ]
    }
  }
}
</script>

<style lang='less' scoped>

</style>
