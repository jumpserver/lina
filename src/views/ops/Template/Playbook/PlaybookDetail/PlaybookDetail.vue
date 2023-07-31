<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :excludes="excludes" :object="object" :url="url" />
    </el-col>
  </el-row>
</template>

<script type="text/jsx">
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
      url: `/api/v1/ops/playbooks/${this.object.id}/`,
      excludes: [
        'path', 'create_method', 'vcs_url'
      ]
    }
  },
  computed: {
    cardTitle() {
      return this.object.name
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
