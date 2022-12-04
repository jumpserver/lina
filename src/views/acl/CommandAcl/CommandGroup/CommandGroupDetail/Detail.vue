<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailCardItems" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'

export default {
  name: 'CommandGroupDetail',
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
          key: this.$t('common.Name'),
          value: this.object.name
        },
        {
          key: this.$t('assets.Type'),
          value: this.object.type.label
        },
        {
          key: this.$t('acl.IgnoreCase'),
          value: this.object.ignore_case
        },
        {
          key: this.$t('acl.Content'),
          value: this.object.content
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

<style scoped>

</style>
