<template>
  <el-row>
    <el-col :md="17" :sm="24">
      <Details :detail-card-items="detailCardItems" :title="$tc('common.BasicInfo')" />
      <Details
        v-if="specialCardItems.length > 0"
        :detail-card-items="specialCardItems"
        :title="$tc('common.ApprovaLevel')"
      />
      <slot id="MoreDetails" />
    </el-col>
  </el-row>
</template>

<script>
import Details from './Details'

export default {
  name: 'GenericTicketDetail',
  components: { Details },
  props: {
    object: {
      type: Object,
      default: () => ({})
    },
    specialCardItems: {
      type: Array,
      default: () => ([])
    },
    detailCardItems: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang='less' scoped>

</style>
