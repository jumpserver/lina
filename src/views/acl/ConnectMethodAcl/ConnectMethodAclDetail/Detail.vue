<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'

export default {
  name: 'Detail',
  components: {
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      url: `/api/v1/acls/connect-method-acls/${this.object.id}/`,
      detailFields: [
        'name',
        {
          key: this.$t('acl.action'),
          value: this.object.action.label
        },
        {
          key: this.$t('acl.reviewer'),
          value: this.object.reviewers.map(item => item.name).join(', ')
        },
        'priority', 'date_created', 'created_by'
      ]
    }
  },
  computed: {
  }
}
</script>

<style lang='less' scoped>

</style>
