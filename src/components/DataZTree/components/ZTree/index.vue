<template>
  <div>
    <ul v-show="loading" class="ztree">
      {{ this.$t('common.tree.Loading') }}...
    </ul>
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
      loading: false
    }
  },
  computed: {
    treeSetting() {
      return this.setting
    }
  },
  mounted() {
    window.treeSearch = this.treeSearch
    this.initTree()
    // $('.treebox').css('height', window.innerHeight - 60)
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
        if (this.treeSetting.showRefresh) {
          this.rootNodeAddDom(
            this.zTree,
            this.treeSetting.callback.refresh
          )
        }

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
    rootNodeAddDom: function(ztree, callback) {
      const vm = this
      const searchIcon = `<a class="tree-search" id="searchIcon">
                            <i class='fa fa-search tree-banner-icon' onclick="treeSearch()"></i>
                             <input type="text" id="searchInput" class="tree-input" />
                          </a>`
      const refreshIcon = " <a id='tree-refresh'><i class='fa fa-refresh'></i></a>"
      const icons = `<span class="tree-banner-icon-zone">
                      ${searchIcon}${refreshIcon}
                    </span>`
      const rootNode = ztree.getNodes()[0]
      $('#' + rootNode.tId).css('position', 'relative')
      let $rootNodeRef
      if (rootNode) {
        $rootNodeRef = $('#' + rootNode.tId + '_a')
        $rootNodeRef.after(icons)
      } else {
        $rootNodeRef = $('#' + ztree.setting.treeId)
        $rootNodeRef.html(icons)
      }
      const refreshIconRef = $('#tree-refresh')
      refreshIconRef.bind('click', function() {
        const result = callback()
        if (result && result.then) {
          result.finally(() => {
            vm.initTree()
          })
        } else {
          vm.initTree()
        }
      })
    },
    refresh: function() {
      const refreshIconRef = $('#tree-refresh')
      refreshIconRef.click()
    },
    getCheckedNodes: function() {
      return this.zTree.getCheckedNodes(true)
    },
    treeSearch() {
      const searchIcon = document.getElementById(`searchIcon`)
      const searchInput = document.getElementById(`searchInput`)
      searchIcon.classList.toggle('active')
      searchInput.focus()
      searchInput.onclick = (e) => {
        e.stopPropagation()
      }
      searchInput.onblur = (e) => {
        e.stopPropagation()
        if (!(e.target.value)) {
          searchIcon.classList.toggle('active')
        }
      }
      searchInput.oninput = _.debounce((e) => {
        e.stopPropagation()
        const value = e.target.value || ''
        this.filterTree(value, this.zTree)
      }, 450)
    },
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
      // const searchNode = tree.getNodesByFilter((node) => node.id === 'search')
      // if (searchNode) {
      //   tree.removeNode(searchNode[0])
      // }

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
        let name = '搜索'
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
      const aaaa = tree.getNodes()
      console.log('aaaa: -------------------------------------sdsds', aaaa)
      console.log('tree: -----------========================tree', tree)
    }
  }

}
</script>

<style lang='less' scoped>
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

  ::v-deep .tree-banner-icon-zone {
    line-height: 24px;
    position: absolute;
    right: 0;
  }

  ::v-deep .tree-search {
    position: relative;
    top: 1px;
    width: 20px;
    height: 20px;
    display: inline-block;
    border-radius: 12px;
    vertical-align: sub;
    transition: .25s;
    overflow: hidden;
    .fa-search {
      padding-top: 1px;
    }
  }

  ::v-deep .tree-search .tree-banner-icon {
    position: absolute;
    top: 7px;
    left: 6px;
    width: 6px;
    height: 6px;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  ::v-deep .tree-search.active, .tree-search.active  {
    width: 160px;
    background: #e0e0e0;
  }

  ::v-deep .tree-search.active:hover {
    border-radius: 12px;
  }

  ::v-deep .tree-search input {
    position: relative;
    left: 19px;
    width: 135px;
    height: 100%;
    background-color: transparent;
    color: #606266;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    outline: none;
  }
</style>
