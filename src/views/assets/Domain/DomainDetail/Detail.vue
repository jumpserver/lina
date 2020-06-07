<template>
  <el-row :gutter="20">
    <el-col :span="18">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :span="6" />
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
          key: this.$t('assets.Name'),
          value: this.object.name
        },
        {
          key: this.$t('assets.Assets'),
          value: `${this.object.asset_count}`
        },
        {
          key: this.$t('assets.Gateway'),
          value: `${this.object.gateway_count}`
        },
        {
          key: this.$t('assets.date_joined'),
          value: toSafeLocalDateStr(this.object.date_created)
        }, {
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
