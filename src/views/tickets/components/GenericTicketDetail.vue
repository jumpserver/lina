<template>
  <el-row :gutter="20">
    <el-col :md="17" :sm="24">
      <Details :detail-card-items="iDetailCardItems" :title="$tc('common.BasicInfo')" />
      <Details
        v-if="specialCardItems.length > 0"
        :detail-card-items="specialCardItems"
        :title="$tc('common.ApplyInfo')"
      />
      <Details
        v-if="object.state.value === 'approved' && assignedCardItems.length > 0"
        :detail-card-items="assignedCardItems"
        :title="$tc('tickets.AssignedInfo')"
      />
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
      default: null
    },
    assignedCardItems: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      statusMap: {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger',
        closed: 'info',
        reopen: 'warning'
      }
    }
  },
  computed: {
    iDetailCardItems() {
      if (this.detailCardItems) {
        return this.detailCardItems
      }
      const { object } = this
      return [
        {
          key: this.$tc('common.Number'),
          value: object['serial_num']
        },
        {
          key: this.$tc('tickets.status'),
          value: object.state.value,
          formatter: (item, val) => {
            const tp = this.statusMap[val]
            return <el-tag type={tp} size='small'>{this.object.state.label}</el-tag>
          }
        },
        {
          key: this.$tc('tickets.type'),
          value: object.type.label
        },
        {
          key: this.$tc('tickets.user'),
          value: object.rel_snapshot.applicant
        },
        {
          key: this.$tc('tickets.OrgName'),
          value: object.org_name
        },
        {
          key: this.$tc('common.DateCreated'),
          value: object.date_created
        },
        {
          key: this.$tc('common.Comment'),
          value: object.comment
        }
      ]
    }
  }

}
</script>

<style lang='less' scoped>

</style>
