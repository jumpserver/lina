<template>
  <el-row>
    <el-col :span="17">
      <Details :detail-card-items="detailCardItems" :title="$t('common.BasicInfo')" />
      <Details :detail-card-items="specialCardItems" :title="$t('common.ApplyInfo')" />
      <slot id="MoreDetails" />
      <Comments :object="object" v-bind="$attrs" />
    </el-col>
    <el-col :span="6" :offset="1">
      <Steps :object="object" />
    </el-col>
  </el-row>
</template>

<script>
import Details from './Details'
import Comments from './Comments'
import Steps from './Steps'
export default {
  name: 'GenericTicketDetail',
  components: { Steps, Comments, Details },
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
