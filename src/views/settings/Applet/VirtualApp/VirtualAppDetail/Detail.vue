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
      url: `/api/v1/terminal/virtual-apps/${this.object.id}`,
      detailFields: ['name', 'image_name', 'version', 'protocols', 'is_active', 'comment']
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
