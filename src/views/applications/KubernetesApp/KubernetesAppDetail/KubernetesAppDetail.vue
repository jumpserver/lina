<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :title="cardTitle" :items="detailItems" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
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
          key: this.$t('common.Name'),
          value: this.object.name
        },
        {
          key: this.$t('applications.type'),
          value: this.object.type_display
        },
        {
          key: this.$t('applications.cluster'),
          value: this.object.attrs.cluster
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('common.createdBy'),
          value: this.object.created_by
        },
        {
          key: this.$t('common.Comment'),
          value: this.object.comment
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>

