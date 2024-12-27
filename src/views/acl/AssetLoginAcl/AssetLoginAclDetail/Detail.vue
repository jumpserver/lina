<template>
  <el-row :gutter="20">
    <el-col :md="20" :sm="24" class="detail-right-quick-actions">
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
      url: `/api/v1/acls/login-asset-acls/${this.object.id}/`,
      detailFields: [
        'name',
        {
          key: this.$t('Action'),
          value: this.object.action.label
        },
        {
          key: this.$t('Reviewer'),
          value: this.object.reviewers.map(item => item.name).join(', ')
        },
        'priority', 'date_created', 'created_by', 'comment'
      ]
    }
  },
  computed: {}
}
</script>

<style lang='less' scoped>

</style>
