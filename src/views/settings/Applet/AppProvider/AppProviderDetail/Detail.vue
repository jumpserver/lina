<template>
  <el-row :gutter="20">
    <el-col :md="10" :sm="24">
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
      url: `/api/v1/terminal/app-providers/${this.object.id}`,
      detailFields: ['name', 'hostname', 'comment']
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
