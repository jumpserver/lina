<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'Detail',
  components: {
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      url: `/api/v1/accounts/gather-account-automations/${this.object.id}/`,
      detailFields: [
        'id', 'name', 'is_periodic',
        {
          key: this.$t('xpack.Cloud.RegularlyPerform'),
          value: this.object?.periodic_display || ''
        },
        {
          key: this.$t('xpack.Cloud.DateLastSync'),
          value: this.object.date_last_sync ? toSafeLocalDateStr(this.object.date_created) : ''
        },
        {
          key: this.$t('xpack.Cloud.DateCreated'),
          value: this.object.date_created ? toSafeLocalDateStr(this.object.date_created) : ''
        },
        'comment'
      ]
    }
  },
  computed: {
  },
  mounted() {

  },
  methods: {

  }
}
</script>

<style lang='less' scoped>

</style>
