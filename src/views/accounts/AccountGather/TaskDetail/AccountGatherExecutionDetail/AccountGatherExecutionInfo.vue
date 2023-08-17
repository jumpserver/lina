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
  components: {
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      url: `/api/v1/accounts/gather-account-executions/${this.object.id}/`,
      detailFields: [
        'id', 'status', 'trigger_display', 'date_start', 'date_finished'
      ]
    }
  },
  computed: {
  }
}
</script>

<style scoped>

</style>
