<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailCardItems" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import { toSafeLocalDateStr } from '@/utils/common'

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
          key: this.$t('common.Name'),
          value: this.object.name
        },
        {
          key: this.$t('xpack.Cloud.PeriodicPerform'),
          value: this.object.is_periodic ? (this.$t('xpack.Cloud.True')) : (this.$t('xpack.Cloud.False'))
        },
        {
          key: this.$t('xpack.Cloud.Periodic'),
          value: this.object.periodic_display
        },
        {
          key: this.$t('xpack.Cloud.DateLastSync'),
          value: this.object.date_last_sync ? toSafeLocalDateStr(this.object.date_created) : ''
        },
        {
          key: this.$t('xpack.Cloud.DateCreated'),
          value: this.object.date_created ? toSafeLocalDateStr(this.object.date_created) : ''
        },
        {
          key: this.$t('common.Comment'),
          value: this.object.comment
        }
      ]
    }

  },
  mounted() {

  },
  methods: {

  }
}
</script>

<style lang='less' scoped>

</style>
