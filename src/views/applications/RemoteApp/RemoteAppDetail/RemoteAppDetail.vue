<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :title="cardTitle" :items="detailItems" />
    </el-col>
  </el-row>
</template>

<script>
import { DetailCard } from '@/components'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'RemoteAppDetail',
  components: {
    DetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    cardTitle() {
      return this.object.name
    },
    detailItems() {
      return [
        {
          key: this.$t('common.table.Name'),
          value: this.object.name
        },
        {
          key: this.$t('applications.asset'),
          value: this.object.asset_info.hostname
        },
        {
          key: this.$t('applications.appType'),
          value: this.object.get_type_display
        },
        {
          key: this.$t('applications.appPath'),
          value: this.object.path
        },
        {
          key: this.$t('common.table.DateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('common.table.CreatedBy'),
          value: this.object.created_by
        },
        {
          key: this.$t('common.table.Comment'),
          value: this.object.comment
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>

