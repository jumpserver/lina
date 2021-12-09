<template>
  <GenericTicketDetail :object="object" :detail-card-items="detailCardItems" :special-card-items="specialCardItems" />
</template>

<script>
import { STATUS_MAP } from '../../const'
import { formatTime, getDateTimeStamp } from '@/utils/index'
import { toSafeLocalDateStr } from '@/utils/common'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'
export default {
  name: 'AssetTicketDetail',
  components: {
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
      statusMap: this.object.status === 'open' ? STATUS_MAP['notified'] : STATUS_MAP[this.object.state],
      imageUrl: require('@/assets/img/admin.png'),
      form: {
        comments: ''
      },
      comments: ''
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('tickets.Applicant'),
          value: this.object['applicant_display']
        },
        {
          key: this.$t('tickets.type'),
          value: this.object.type_display
        },
        {
          key: this.$t('tickets.status'),
          value: this.object.status,
          formatter: (item, val) => {
            return <el-tag type={this.statusMap.type} size='mini'> { this.statusMap.title }</el-tag>
          }
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        }
      ]
    },
    specialCardItems() {
      return this.object.type === 'login_confirm' ? [] : [
        // apply_login_asset: "114.118.2.76(114.118.2.76)"
        // apply_login_system_user: "root()"
        // apply_login_user: "Administrator(admin)"
        {
          key: this.$t('acl.apply_login_asset'),
          value: this.object.meta['apply_login_asset']
        },
        {
          key: this.$t('acl.apply_login_system_user'),
          value: this.object.meta['apply_login_system_user']
        },
        {
          key: this.$t('acl.apply_login_user'),
          value: this.object.meta['apply_login_user']
        }
      ]
    }
  },
  methods: {
    formatTime(dateStr) {
      return formatTime(getDateTimeStamp(dateStr))
    },
    toSafeLocalDateStr(dataStr) {
      return toSafeLocalDateStr(dataStr)
    }
  }
}
</script>

<style scoped>
</style>
