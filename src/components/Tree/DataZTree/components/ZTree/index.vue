<template>
  <div>
    <div class="treebox">
      <div>
        <el-input
          v-if="treeSetting.showSearch && showTreeSearch"
          v-model="treeSearchValue"
          :placeholder="$tc('common.Search')"
          class="fixed-tree-search"
          prefix-icon="fa fa-search"
          size="mini"
          @input="treeSearchHandle"
        >
          <span slot="suffix">
            <!-- <i class="fa fa-search" style="font-size: 14px; color: #676A6C;" /> -->
            <svg-icon
              :icon-class="'close'"
              class="icon"
              style="font-size: 14px;"
              @click="onClose"
            />
          </span>
        </el-input>
      </div>
      <ul v-show="loading" class="ztree">
        {{ this.$t('common.tree.Loading') }}...
      </ul>
      <ul v-show="!loading" :id="iZTreeID" :key="iZTreeID" class="ztree" />
      <div v-if="treeSetting.treeUrl===''" class="tree-empty">
        {{ this.$t('common.tree.Empty') }}
        <a id="tree-refresh"><i class="fa fa-refresh" /></a>
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
import '@/styles/ztree_icon.scss'
import axiosRetry from 'axios-retry'

const defaultObject = {
  type: Object,
  default: () => {
  }
}
export default {
  name: 'ZTree',
  components: {},
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
      showTreeSearch: JSON.parse(localStorage.getItem('showTreeSearch')) || false,
      treeSearchValue: ''
    }
  },
  computed: {
    treeSetting() {
      return this.setting
    }
  },
  mounted() {
    window.refresh = this.refresh
    window.onSearch = this.onSearch
    this.initTree()
  },
  beforeDestroy() {
    $.fn.zTree.destroy(this.iZTreeID)
  },
  methods: {
    async initTree(refresh = false) {
      const vm = this
      let treeUrl
      this.loading = true
      if (refresh && this.treeSetting.treeUrl.indexOf('/perms/') !== -1 &&
        this.treeSetting.treeUrl.indexOf('rebuild_tree') === -1
      ) {
        treeUrl = (this.treeSetting.treeUrl.indexOf('?') === -1)
          ? `${this.treeSetting.treeUrl}?rebuild_tree=1`
          : `${this.treeSetting.treeUrl}&rebuild_tree=1`
      } else {
        treeUrl = this.treeSetting.treeUrl
      }

      if (refresh) {
        $.fn.zTree.destroy(this.iZTreeID)
      }

      let res = await this.$axios.get(treeUrl, {
        'axios-retry': {
          retries: 20,
          retryCondition: e => {
            return axiosRetry.isNetworkOrIdempotentRequestError(e) || e.response.status === 409
          },
          shouldResetTimeout: true,
          retryDelay: () => {
            return 5000
          }
        }
      })
      vm.loading = false
      if (!res) res = []
      if (res?.length === 0) {
        res?.push({
          name: this.$t('common.tree.Empty')
        })
      }
      this.treeSetting.treeUrl = treeUrl
      vm.zTree = $.fn.zTree.init($(`#${this.iZTreeID}`), this.treeSetting, res)
      const rootNode = this.zTree.getNodes()[0]
      this.rootNodeAddDom(rootNode)
      // 手动上报事件, Tree加载完成
      this.$emit('TreeInitFinish', this.zTree)

      if (this.treeSetting.showMenu) {
        this.rMenu = $(`#${this.iRMenuID}`)
      }
      if (this.treeSetting?.otherMenu) {
        $('.menu-actions').append(this.otherMenu)
      }
    },
    onSearch() {
      this.showTreeSearch = !this.showTreeSearch
      localStorage.setItem('showTreeSearch', JSON.stringify(this.showTreeSearch))
    },
    onClose() {
      this.refresh()
      this.onSearch()
    },
    rootNodeAddDom(rootNode) {
      const { showSearch, showRefresh } = this.treeSetting
      const searchIcon = `
        <a class="tree-action-btn" id="search-btn" onclick="onSearch()">
          <i class="fa fa-search tree-banner-icon"></i>
        </a>`
      const refreshIcon = `
        <a id="tree-refresh" class="tree-action-btn" onclick="refresh()">
          <i class="fa fa-refresh"></i>
        </a>`
      const treeActions = `${showSearch ? searchIcon : ''}${showRefresh ? refreshIcon : ''}`
      const icons = `
        <span style="float: right; margin-right: 10px">
          ${treeActions}
        </span>`
      if (rootNode) {
        const $rootNodeRef = $('#' + rootNode.tId + '_a')
        $rootNodeRef.after(icons)
      }
    },
    async refresh() {
      this.treeSearchValue = ''
      if (this.treeSetting?.callback?.beforeRefresh) {
        this.treeSetting.callback.beforeRefresh()
      }
      if (this.treeSetting?.callback?.refresh) {
        await this.treeSetting.callback.refresh()
      }
      this.zTree.destroy()
      setTimeout(() => this.initTree(true), 200)
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
      searchInput.oninput = e => this.treeSearchHandle((e.target.value || ''))
    },
    treeSearchHandle: _.debounce(function(value) {
      if (this.treeSetting.async.enable) {
        this.filterAssetsServer(value)
      } else {
        this.filterTree(value)
      }
    }, 600),
    getCheckedNodes: function() {
      return this.zTree.getCheckedNodes(true)
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
    groupBy(array, filter) {
      const groups = {}
      array.forEach(function(o) {
        const group = JSON.stringify(filter(o))
        groups[group] = groups[group] || []
        groups[group].push(o)
      })
      return Object.keys(groups).map(function(group) {
        return groups[group]
      })
    },
    filterTree(keyword, tree = this.zTree) {
      if (!this.zTree) return
      const searchNode = tree.getNodesByFilter((node) => node.id === 'search')
      if (searchNode) tree.removeNode(searchNode[0])
      const nodes = tree.transformToArray(tree.getNodes())
      if (!keyword) {
        tree.showNodes(nodes)
        return
      }

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
        const newNode = { id: 'search', name: name, isParent: false, open: false }
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
      for (const node of shouldShow) {
        if (node.isParent) {
          tree.expandNode(node, true)
        }
      }
    },
    filterAssetsServer(keyword) {
      if (!this.zTree) return
      let searchNode = this.zTree.getNodesByFilter((node) => node.id === 'search')
      if (searchNode) {
        this.zTree.removeChildNodes(searchNode[0])
        this.zTree.removeNode(searchNode[0])
      }
      const treeNodes = this.zTree.getNodes()
      if (!keyword) {
        if (treeNodes.length !== 0) {
          this.zTree.showNodes(treeNodes)
        }
        return
      }
      if (treeNodes.length !== 0) {
        this.zTree.hideNodes(treeNodes)
      }

      let treeUrl = this.treeSetting.searchUrl ? this.treeSetting.searchUrl : this.treeSetting.treeUrl
      const filterField = treeUrl.includes('?') ? `&search=${keyword}` : `?search=${keyword}`
      if (treeUrl.indexOf('assets/nodes/children/tree') > -1) {
        treeUrl = treeUrl + '&all=all'
      }
      const searchUrl = `${treeUrl}${filterField}`
      this.$axios.get(searchUrl).then(nodes => {
        let name = this.$t('common.Search')
        const assetsAmount = nodes.length
        name = `${name} (${assetsAmount})`
        const newNode = { id: 'search', name: name, isParent: true, open: true, zAsync: true }
        searchNode = this.zTree.addNodes(null, newNode)[0]
        searchNode.zAsync = true
        this.rootNodeAddDom(searchNode)

        const nodesGroupByOrg = this.groupBy(nodes, (node) => {
          return node.meta?.data?.org_name
        })

        for (const item of nodesGroupByOrg) {
          this.zTree.addNodes(searchNode, item)
        }
        searchNode.open = true
      })
    }
  }

}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar-corner {
  background: transparent;
}

::-webkit-scrollbar-track:horizontal {
  background: #FFFFFF;
  border-radius: 10px;
}

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

div.rMenu li {
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

.dropdown-menu > li > a:hover, .dropdown-menu > li > a:focus {
  color: #262626;
  text-decoration: none;
  background-color: #f5f5f5;
}

.treebox {
  background-color: transparent;

  > > > .ztree {
    overflow: auto;
    background-color: transparent;
    height: calc(100vh - 237px);

    li {
      background-color: transparent !important;

      .button {
        background-color: rgba(0, 0, 0, 0);
      }

      ul {
        background-color: transparent !important;
      }
    }
  }
}

::v-deep #tree-refresh {
  margin-left: 3px;
}

::v-deep .tree-banner-icon-zone {
  position: absolute;
  right: 7px;
  height: 30px;
  overflow: hidden;

  .fa {
    color: #838385 !important;;

    &:hover {
      color: #606266 !important;;
    }
  }
}

::v-deep .tree-search {
  position: relative;
  top: -2px;
  width: 20px;
  height: 20px;
  display: inline-block;
  border-radius: 12px;
  vertical-align: sub;
  transition: .25s;
  overflow: hidden;

  .fa {
    width: 13px !important;
  }

  .fa-search {
    padding-top: 1px;
  }
}

::v-deep .tree-search .tree-banner-icon {
  position: absolute;
  top: 4px;
  left: 6px;
  border-radius: 12px;
  overflow: hidden;
  background-color: transparent !important;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

::v-deep .tree-search.active {
  width: 160px;
  background-color: #ffffff !important;
}

::v-deep .tree-search.active:hover {
  border-radius: 12px;
}

::v-deep .tree-search input {
  position: relative;
  left: 20px;
  width: 133px;
  height: 100%;
  background-color: #ffffff !important;
  color: #606266;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  outline: none;
}

.tree-header {
  position: relative;

  .title {
    font-weight: 500;
  }

  .content {
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid #e0e0e0;
    border-radius: 3px;
    padding: 0 5px;
    box-sizing: border-box;
    overflow: hidden;
    cursor: pointer;
    background-color: #D7D8DC;

    .rotate {
      transition: all .1 .8s;
      transform: rotate(-90deg);
    }

    .fa-caret-down {
      font-size: 16px;
    }

    .special {
      top: 1px !important;
    }
  }
}

.tree-empty {
  margin-left: 4px;
}

.fixed-tree-search {
  margin-bottom: 10px;

  & > > > .el-input__inner {
    border-radius: 4px;
    background: #fafafa;
    padding-right: 32px;
  }

  & > > > .el-input__suffix {
    padding-right: 8px;
  }

  & > > > .el-input__prefix {
    padding-left: 6px;
  }

  & > > > .el-input__suffix-inner {
    line-height: 30px;
  }
}

.icon-refresh {
  border-radius: 4px;
  padding: 0 1px;
  z-index: 1;

  &:hover {
    cursor: pointer;
    color: #606266;
    border-color: #d2d2d2;
    background-color: #e6e6e6;
  }
}

.icon {
  cursor: pointer;
}

.tree-action-btn {
  padding: 0 2px;
  color: red;
}
</style>
