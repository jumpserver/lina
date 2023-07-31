<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="14" :sm="24">
        <AutoDetailCard :object="object" :url="url" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'

export default {
  name: 'TerminalDetail',
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
      url: `/api/v1/terminal/terminals/${this.object.id}/`
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
