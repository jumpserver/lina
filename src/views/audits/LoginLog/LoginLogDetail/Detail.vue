<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="14" :sm="24">
        <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
      </el-col>
    </el-row>
  </div>
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
      default: () => {}
    }
  },
  data() {
    return {
      url: `/api/v1/audits/login-logs/${this.object.id}`,
      detailFields: [
        'id', 'username', 'city', 'ip', 'backend_display', 'reason_display', 'status', 'type', 'user_agent', 'datetime'
      ]
    }
  },
  computed: {
  }
}
</script>

<style lang="scss" scoped>
</style>
