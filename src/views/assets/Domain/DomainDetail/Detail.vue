<template>
  <el-row :gutter="20">
    <el-col :md="15" :sm="24">
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
      default: () => {}
    }
  },
  data() {
    return {
      url: `/api/v1/assets/domains/${this.object.id}/`,
      detailFields: [
        'name', 'assets_amount',
        {
          key: this.$t('Gateway'),
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
