<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :span="10" />
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
          key: this.$t('assets.name'),
          value: this.object.name
        },
        {
          key: this.$t('assets.资产'),
          value: `${this.object.asset_count}`
        },
        {
          key: this.$t('assets.网关'),
          value: `${this.object.gateway_count}`
        },
        {
          key: this.$t('assets.date_created'),
          value: toSafeLocalDateStr(this.object.date_created)
        }, {
          key: this.$t('assets.comment'),
          value: this.object.comment
        }
      ]
    }
  }
}
</script>

<style lang='less' scoped>

</style>
