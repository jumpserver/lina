<template>
  <el-row :gutter="20">
    <el-col :md="17" :sm="24">
      <Details :detail-card-items="detailCardItems" :title="$t('common.BasicInfo')" />
      <Details v-if="specialCardItems.length > 0" :detail-card-items="specialCardItems" :title="$t('common.ApplyInfo')" />
      <Details v-if="object.state === 'approved' && assignedCardItems.length > 0" :detail-card-items="assignedCardItems" :title="$t('tickets.AssignedInfo')" />
      <slot id="MoreDetails" />
      <Comments :object="object" v-bind="$attrs" />
    </el-col>
    <el-col :md="7" :sm="24">
      <Steps :object="object" />
      <Session v-perms="'tickets.view_ticket'" :object="object" />
    </el-col>
  </el-row>
</template>

<script>
import Details from './Details'
import Comments from './Comments'
import Steps from './Steps'
import Session from './Session'

export default {
  name: 'GenericTicketDetail',
  components: { Steps, Comments, Details, Session },
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
    },
    assignedCardItems: {
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
