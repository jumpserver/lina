<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
    <el-col :md="10" :sm="24" />
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
      default: () => {}
    }
  },
  data() {
    return {
      url: `/api/v1/assets/domains/${this.object.id}`,
      detailFields: [
        'name',
        {
          key: this.$t('assets.Assets'),
          value: `${this.object.assets.length}`
        },
        {
          key: this.$t('assets.Gateway'),
          value: `${this.object.gateways.length}`
        },
        'date_created', 'comment'
      ]
    }
  },
  computed: {
  }
}
</script>

<style lang='less' scoped>

</style>
