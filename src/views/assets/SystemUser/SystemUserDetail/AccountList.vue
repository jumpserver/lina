<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16">
        <AssetUserTable ref="ListTable" :url="assetUserUrl" :has-import="false" />
      </el-col>
      <el-col :span="8" />
    </el-row>
  </div>
</template>

<script>

import { AssetUserTable } from '@/components'

export default {
  name: 'AccountList',
  components: {
    AssetUserTable
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      assetUserUrl: `/api/v1/assets/asset-users/?prefer_id=${this.object.id}&prefer=system_user&latest=1`
    }
  },
  computed: {
  },
  mounted() {
    this.getNodeList()
  },
  methods: {
    getNodeList() {
      this.$axios.get(
        `/api/v1/assets/system-users-nodes-relations/?systemuser=${this.object.id}&draw=1&limit=15&offset=0`
      ).then(data => {
        for (const x in data.results) {
          this.nodeRelationConfig.hasObjectsId.push(data.results[x].node)
          this.nodeRelationConfig.hasObjects.push({
            value: data.results[x].node,
            label: data.results[x].node_display
          })
        }
      }
      )
    }
  }
}
</script>

<style lang='less' scoped>

</style>
