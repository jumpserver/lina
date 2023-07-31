<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :excludes="excludes" :object="object" :url="url" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'

export default {
  name: 'AccountDetail',
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
      url: `/api/v1/xpack/cloud/accounts/${this.object.id}/`,
      excludes: ['attrs']
    }
  },
  computed: {
    cardTitle() {
      return this.object.name
    }
  }
}
</script>

<style scoped>

</style>

