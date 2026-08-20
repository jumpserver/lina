<template>
  <GenericTicketDetail :detail-card-items="detailCardItems" :object="object" />
</template>

<script lang="jsx">
import { STATUS_MAP } from '../const'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import CcUsers from '@/views/tickets/components/CcUsers'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'
import { getAssetUrl } from '@/utils/assets'
export default {
  name: 'TicketDetail',
  components: {
    CcUsers,
    GenericTicketDetail
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      statusMap:
        this.object.status.value === 'open'
          ? STATUS_MAP['pending']
          : STATUS_MAP[this.object.state.value],
      imageUrl: getAssetUrl('img/avatar.png'),
      form: {
        comments: ''
      },
      comments: ''
    }
  },
  computed: {
    detailCardItems() {
      const { object } = this
      return [
        {
          key: this.$t('Applicant'),
          value: object.rel_snapshot.applicant
        },
        {
          key: this.$t('Type'),
          value: object.type.lable
        },
        {
          key: this.$t('TicketFlow'),
          value: object.flow?.name || object.type.label
        },
        {
          key: this.$t('Status'),
          value: object.status,
          formatter: (item, val) => {
            return (
              <el-tag type={this.statusMap.type} size="small">
                {' '}
                {this.statusMap.title}
              </el-tag>
            )
          }
        },
        {
          key: this.$t('Assignees'),
          value: object.process_map[object.approval_step.value - 1].assignees_display.join(',')
        },
        {
          key: this.$t('Assignee'),
          value: object.process_map[object.approval_step.value - 1].processor_display
        },
        {
          key: this.$t('CcUsers'),
          value: object.cc_users,
          formatter: (item, users) => <CcUsers users={users} />
        },
        {
          key: this.$t('DateCreated'),
          value: toSafeLocalDateStr(object.date_created)
        }
      ]
    }
  }
}
</script>

<style scoped></style>
