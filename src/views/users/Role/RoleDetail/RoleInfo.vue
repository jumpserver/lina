<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailItems" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'RoleInfo',
  components: {
    DetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: true
    }
  },
  computed: {
    detailItems() {
      return [
        {
          key: this.$t('common.Name'),
          value: this.object.display_name
        },
        {
          key: this.$t('common.Scope'),
          value: this.object['scope_display']
        },
        {
          key: this.$t('common.Builtin'),
          value: this.object['builtin']
        },
        {
          key: this.$t('common.CreatedBy'),
          value: this.object.created_by
        },
        {
          key: this.$t('common.DateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('common.DateUpdated'),
          value: toSafeLocalDateStr(this.object.date_updated)
        },
        {
          key: this.$t('common.Comment'),
          value: this.object.comment
        }
      ]
    }
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
</style>
