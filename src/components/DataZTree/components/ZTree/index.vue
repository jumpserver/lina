<template>
  <div>
    <ul v-show="loading" class="ztree">
      {{ this.$t('common.tree.Loading') }}...
    </ul>
    <div v-show="!loading" class="search-box">
      <el-input
        v-if="treeSetting.showRefresh"
        v-model="treeSearchValue"
        :placeholder="$t('common.Search')"
        clearable
        size="mini"
        @input="treeSearchHandle"
      />
      <span
        v-if="treeSetting.showRefresh"
        class="refresh"
        @click="refresh"
      >
        <i class="fa fa-refresh" />
      </span>
    </div>
    <div v-show="!loading" class="treebox">
      <ul :id="iZTreeID" class="ztree">
        {{ this.$t('common.tree.Loading') }}...
      </ul>
      <div v-if="treeSetting.treeUrl===''">
        {{ this.$t('common.tree.Empty') }}<a id="tree-refresh"><i class="fa fa-refresh" /></a>
      </div>
    </div>
    <div :id="iRMenuID" class="rMenu">
      <ul class="dropdown-menu menu-actions">
        <slot name="rMenu" />
      </ul>
    </div>
  </div>
</template>

<script>
// 导入JQuery
// eslint-disable-next-line no-unused-vars
import $ from '@/utils/jquery-vendor.js'
import '@ztree/ztree_v3/js/jquery.ztree.all.min.js'
import '@ztree/ztree_v3/js/jquery.ztree.exhide.min.js'
import '@/styles/ztree.css'
import axiosRetry from 'axios-retry'

const defaultObject = {
  type: Object,
  default: () => {}
}
export default {
  name: 'ZTree',
  components: {
  },
  props: {
    setting: defaultObject
  },
  data() {
    return {
      iZTreeID: `zTree_${this._uid}`,
      iRMenuID: `rMenu_${this._uid}`,
      zTree: '',
      rMenu: '',
      init: false,
      loading: false,
      treeSearchValue: ''
    }
  },
  computed: {
    treeSetting() {
      return this.setting
    }
  },
  mounted() {
    this.initTree()
  },
  beforeDestroy() {
    $.fn.zTree.destroy(this.iZTreeID)
  },
  methods: {
    initTree: function() {
      const vm = this
      let treeUrl
      if (this.init) {
        this.loading = true
      }
      if (this.init && this.treeSetting.treeUrl.indexOf('/perms/') !== -1 && this.treeSetting.treeUrl.indexOf('rebuild_tree') === -1) {
        treeUrl = (this.treeSetting.treeUrl.indexOf('?') === -1) ? `${this.treeSetting.treeUrl}?rebuild_tree=1` : `${this.treeSetting.treeUrl}&rebuild_tree=1`
      } else {
        treeUrl = this.treeSetting.treeUrl
      }
      this.$axios.get(treeUrl, {
        'axios-retry': {
          retries: 20,
          retryCondition: e => {
            return axiosRetry.isNetworkOrIdempotentRequestError(e) || e.response.status === 409
          },
          shouldResetTimeout: true,
          retryDelay: () => { return 5000 }
        }
      }).then(res => {
        if (!res) {
          res = []
        }
        if (res.length === 0) {
          res.push({
            name: this.$t('common.tree.Empty')
          })
        }
        this.treeSetting.treeUrl = treeUrl
        if (this.init) {
          vm.zTree.destroy()
        }
        this.zTree = $.fn.zTree.init($(`#${this.iZTreeID}`), this.treeSetting, res)
        // 手动上报事件, Tree加载完成
        this.$emit('TreeInitFinish', this.zTree)

        if (this.treeSetting.showMenu) {
          this.rMenu = $(`#${this.iRMenuID}`)
        }
        if (this.treeSetting.otherMenu) {
          $('.menu-actions').append(this.otherMenu)
        }
      }).finally(_ => {
        vm.loading = false
        vm.init = true
      })
    },
    refresh() {
      const result = this.treeSetting?.callback?.refresh()
      this.treeSearchValue = ''
      if (result && result.then) {
        result.finally(() => {
          this.initTree()
        })
      } else {
        this.initTree()
      }
    },
    getCheckedNodes: function() {
      return this.zTree.getCheckedNodes(true)
    },
    treeSearchHandle: _.debounce(function(value) {
      const vm = this
      vm.filterTree(value, vm.zTree)
    }, 450),
    recurseParent(node) {
      const parentNode = node.getParentNode()
      if (parentNode && parentNode.pId) {
        return [parentNode, ...this.recurseParent(parentNode)]
      } else if (parentNode) {
        return [parentNode]
      } else {
        return []
      }
    },
    recurseChildren(node) {
      if (!node.isParent) {
        return []
      }
      const children = node.children
      if (!children) {
        return []
      }
      let allChildren = []
      children.forEach((n) => {
        allChildren = [...children, ...this.recurseChildren(n)]
      })
      return allChildren
    },
    filterTree(keyword, tree) {
      const searchNode = tree.getNodesByFilter((node) => node.id === 'search')
      if (searchNode) {
        tree.removeNode(searchNode[0])
      }

      const nodes = tree.transformToArray(tree.getNodes())
      if (!keyword) {
        if (tree.hiddenNodes) {
          tree.showNodes(tree.hiddenNodes)
          tree.hiddenNodes = null
        }
        if (tree.expandNodes) {
          tree.expandNodes.forEach((node) => {
            if (node.id !== nodes[0].id) {
              tree.expandNode(node, false)
            }
          })
          tree.expandNodes = null
        }
        return null
      }
      let shouldShow = []
      const matchedNodes = tree.getNodesByFilter((node) => {
        return node.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1
      })

      if (matchedNodes.length < 1) {
        let name = this.$t('common.Search')
        const assetsAmount = matchedNodes.length
        name = `${name} (${assetsAmount})`
        const newNode = { id: 'search', name: name, isParent: true, open: true }
        tree.addNodes(null, newNode)
      }

      matchedNodes.forEach((node) => {
        const parents = this.recurseParent(node)
        const children = this.recurseChildren(node)
        shouldShow = [...shouldShow, ...parents, ...children, node]
      })
      tree.hiddenNodes = nodes
      tree.expandNodes = shouldShow
      tree.hideNodes(nodes)
      tree.showNodes(shouldShow)
      shouldShow.forEach((node) => {
        if (node.isParent) {
          tree.expandNode(node, true)
        }
      })
    }
  }

}
</script>

<style lang='scss' scoped>
  div.rMenu {
    position: absolute;
    visibility: hidden;
    text-align: left;
    top: 0;
    left: 0;
    z-index: 999;
    float: left;
    padding: 0 0;
    margin: 2px 0 0;
    list-style: none;
    background-clip: padding-box;
  }
  .dataTables_wrapper .dataTables_processing {
    opacity: .9;
    border: none;
  }
  div.rMenu li{
    margin: 6px 0;
    cursor: pointer;
    list-style: none outside none;
  }
  .dropdown-menu {
    border: medium none;
    min-width: 160px;
    background-color: #fff;
    border-radius: 3px;
    box-shadow: 0 0 3px rgba(86, 96, 117, 0.7);
    display: block;
    float: left;
    font-size: 12px;
    left: 0;
    list-style: none outside none;
    padding: 0;
    position: absolute;
    text-shadow: none;
    top: 100%;
    z-index: 1000;
  }
  .ztree ::v-deep .fa {
    font: normal normal normal 14px/1 FontAwesome !important;
  }
  .dropdown a:hover {
    background-color: #f1f1f1
  }
  .dropdown-menu > li > a {
    border-radius: 3px;
    color: inherit;
    line-height: 25px;
    margin: 4px;
    text-align: left;
    font-weight: normal;
    display: block;
    padding: 3px 20px;
    clear: both;
    white-space: nowrap;
  }
  .dropdown-menu>li>a:hover, .dropdown-menu>li>a:focus {
    color: #262626;
    text-decoration: none;
    background-color: #f5f5f5;
  }
  .treebox {
    height: 80vh;
    overflow: auto;
  }

  .search-box {
    display: flex;
    height: 24px;
    &>>> .el-input {
      flex: 1;
      margin-left: 4px;
    }
    &>>> .el-input__inner {
      height: 24px;
      line-height: 24px;
      border-radius: 3px;
      font-size: 12px;
    }
    &>>> .el-input__suffix {
      line-height: 24px;
    }
    .refresh {
      cursor: pointer;
      border-radius: 3px;
      margin-left: 6px;
      margin-right: 6px;
      padding: 0 7px 0 6px;
      line-height: 24px;
      &:hover {
        background: #e5e6e7;
      }
    }
  }
</style>
