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
      url: `/api/v1/terminal/applets/${this.object.id}`,
      detailFields: [
        'name', 'author', 'display_name',
        {
          key: this.$t('assets.Protocols'),
          formatter: () => {
            const data = this.object.protocols.map(p => <el-tag size='mini'>{p} </el-tag>)
            return <span> {data} </span>
          }
        },
        {
          key: this.$t('assets.Label'),
          value: this.object.tags.join(',')
        },
        {
          key: this.$t('assets.Type'),
          value: this.object.type.label
        },
        'date_created', 'date_updated', 'comment'
      ]
    }
  },
  computed: {
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style lang='less' scoped>

</style>
