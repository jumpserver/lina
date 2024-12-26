<template>
  <el-row :gutter="20">
    <el-col :md="20" :sm="24">
      <AutoDetailCard :object="detail" :url="url" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'

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
      url: `/api/v1/accounts/gathered-accounts/${this.object.id}/details/`,
      detail: this.object?.detail
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
