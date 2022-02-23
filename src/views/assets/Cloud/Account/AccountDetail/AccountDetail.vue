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
  name: 'AccountDetail',
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
          key: this.$t('xpack.Cloud.Provider'),
          value: this.object.provider_display
        },
        {
          key: this.$t('xpack.Cloud.Validity'),
          value: this.object.validity ? this.$t('common.Validity') : this.$t('common.Invalidity')
        },
        {
          key: this.$t('common.Comment'),
          value: this.object.comment
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('common.createdBy'),
          value: this.object.created_by
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>

