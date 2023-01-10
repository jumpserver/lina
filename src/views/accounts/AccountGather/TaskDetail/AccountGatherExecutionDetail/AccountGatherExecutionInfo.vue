<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :url="url" :fields="detailFields" :object="object" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/DetailCard/auto'

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
        'status', 'trigger_display', 'date_start', 'date_finished'
      ]
    }
  },
  computed: {
  }
}
</script>

<style scoped>

</style>
