<template>
  <el-tree
    :data="treeData"
    :props="defaultProps"
    :lazy="true"
    :load="loadSubNode"
    :expand-on-click-node="false"
    :highlight-current="true"
    class="tree"
    @node-click="nodeClick"
  >
    <span slot-scope="{ node, data }">
      <span v-if="(data.type==='node')"><i class="el-icon-folder" /></span>
      <span v-if="data.type==='asset'"><i class="el-icon-coin" /></span>
      <span style="margin-left: 3px;">{{ node.label }}</span>
      <span v-if="(data.type==='node')&(node.level === 1)">
        <i class="fa fa-refresh" @click="reloadtree" />
      </span>
    </span>
  </el-tree>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      default: () => ''
    },
    treeUrl: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'label',
        isLeaf: 'leaf'
      },
      treeData: [],
      tableData: [],
      internalUrl: ''
    }
  },
  mounted() {
    this.internalUrl = this.url
  },
  methods: {
    reloadtree: function() {

    },
    nodeClick: function(node) {
      // const data = {}
      // if (node.type === 'node') {
      //   Object.assign(data, { node_id: node.id, asset_id: '' })
      // } else {
      //   Object.assign(data, { node_id: '', asset_id: node.id })
      // }
      if (node.type === 'node') {
        console.log(this.url)
        this.$emit('urlChanged', this.internalUrl + '?node_id=' + node.id)
      } else {
        this.$emit('urlChanged', this.internalUrl + '?asset_id=' + node.id)
      }

      // this.$axios.get(this.url, { params: data }).then(res => {
      //   this.tableData = res
      // }).catch((error) => {
      //   this.$notify({
      //     title: error.status,
      //     message: this.$createElement('i', { style: 'color: teal' }, error),
      //     type: 'error'
      //   })
      // })
    },
    loadSubNode: function(node, resolve) {
      if (node.level === 0) {
        this.$axios.get(this.treeUrl, { params: { assets: 1 }}).then(res => {
          console.log(res)
          resolve([{
            label: res[0].name,
            id: res[0].meta.node.id,
            type: res[0].meta.type
          }])
        }).catch((error) => {
          this.$notify({
            title: error.status,
            message: this.$createElement('i', { style: 'color: teal' }, error),
            type: 'error'
          })
        })
      } else {
        // /rpc/api/v1/assets/nodes/children/tree/?assets=1&key=1&id=' + id,
        const subtree = []
        this.$axios.get(this.treeUrl, { params: {
          assets: 1,
          key: 1,
          id: node.data.id
        }}
        ).then(res => {
          console.log(res)
          for (let index = 0; index < res.length; index++) {
            var child = {}
            child.type = res[index].meta.type
            if (res[index].meta.type === 'asset') {
              child.id = res[index].id
              child.leaf = true
            } else { child.id = res[index].meta.node.id }
            child.label = res[index].name
            subtree.push(child)
          }
          resolve(subtree)
        }).catch((error) => {
          console.log(error)
          resolve([])
          this.$notify({
            title: error.status,
            message: this.$createElement('i', { style: 'color: teal' }, error.statusText),
            type: 'error'
          })
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.tree{
  font-size: 14px;
}
</style>
