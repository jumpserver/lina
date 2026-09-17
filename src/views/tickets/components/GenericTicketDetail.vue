<template>
  <el-row :gutter="20">
    <el-col :md="17" :sm="24">
      <Details :detail-card-items="iDetailCardItems" :title="$tc('BasicInfo')" />
      <Details
        v-if="specialCardItems.length > 0"
        :detail-card-items="specialCardItems"
        :title="$tc('ApplyInfo')"
      />
      <Details
        v-if="object.state.value === 'approved' && assignedCardItems.length > 0"
        :detail-card-items="assignedCardItems"
        :title="$tc('AssignedInfo')"
      />
      <slot id="MoreDetails" />
      <Comments v-bind="$attrs" :object="object" />
    </el-col>
    <el-col :md="7" :sm="24">
      <Steps :object="object" />
      <Session v-if="$hasPerm('tickets.view_ticket')" :object="object" />
    </el-col>
  </el-row>
</template>

<script lang="jsx">
import Comments from './Comments'
import CcUsers from './CcUsers'
import Details from './Details'
import Session from './Session'
import Steps from './Steps'
import { getTicketFlowLabel, getTicketStateLabel, getTicketTypeLabel } from '../const'
export default {
  name: 'GenericTicketDetail',
  components: {
    Steps,
    CcUsers,
    Comments,
    Details,
    Session
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    },
    specialCardItems: {
      type: Array,
      default: () => []
    },
    detailCardItems: {
      type: Array,
      default: null
    },
    assignedCardItems: {
      type: Array,
      default: () => []
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
          key: this.$tc('Number'),
          value: object['serial_num']
        },
        {
          key: this.$tc('Status'),
          value: object.state.value,
          formatter: (item, val) => {
            const tp = this.statusMap[val]
            return (
              <el-tag type={tp} size="small">
                {getTicketStateLabel(this.object.state, this.$t)}
              </el-tag>
            )
          }
        },
        {
          key: this.$tc('Type'),
          value: getTicketTypeLabel(object.type, this.$t)
        },
        {
          key: this.$t('TicketFlow'),
          value: getTicketFlowLabel(object, this.$t)
        },
        {
          key: this.$tc('User'),
          value: object.rel_snapshot.applicant
        },
        {
          key: this.$t('CcUsers'),
          value: object.cc_users,
          formatter: (item, users) => <CcUsers users={users} />
        },
        {
          key: this.$tc('OrgName'),
          value: object.org_name
        },
        {
          key: this.$tc('DateCreated'),
          value: object.date_created
        },
        {
          key: this.$tc('Comment'),
          value: object.comment
        }
      ]
    }
  }
}
</script>
