<template>
  <div>
    <div class="treebox">
      <div v-if="treeSetting.showSearch" @click="focusTreeSearchInput">
        <el-input
          v-show="showTreeSearch"
          ref="treeSearchInput"
          v-model="treeSearchValue"
          class="fixed-tree-search"
          :placeholder="treeSearchInputPlaceholder"
          size="mini"
          @input="treeSearchHandle"
        >
          <template #prepend>

            <template v-if="!isSearchTypeDropdownEnabled">
              <el-tooltip
                effect="dark"
                placement="top"
                :content="currentTreeSearchTypeTooltip"
                :open-delay="300"
              >
                <span style="cursor: pointer;" @click.stop="focusTreeSearchInput">
                  <i class="fa fa-search" />
                  <span class="search-label">{{ treeSearchTypeLabel }}</span>
                </span>
              </el-tooltip>
            </template>

            <template v-else>
              <el-dropdown trigger="hover" @command="onSearchTypeChange">
                <el-tooltip
                  effect="dark"
                  placement="top"
                  :content="currentTreeSearchTypeTooltip"
                  :open-delay="1000"
                >
                  <span @click.stop="focusTreeSearchInput">
                    <i class="fa fa-search" />
                    <span class="search-label">{{ treeSearchTypeLabel }}</span>
                    <i class="el-icon-arrow-down" />
                  </span>
                </el-tooltip>

                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="(item, type) in treeSearchTypeOptions"
                    :key="type"
                    :command="type"
                    :class="{ 'is-active': treeSearchType === type }"
                  >
                    <el-tooltip
                      effect="dark"
                      placement="right"
                      :content="item.tooltip"
                      :open-delay="300"
                    >
                      <span>{{ item.label }}</span>
                    </el-tooltip>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </template>
          <span slot="suffix">
            <i
              class="el-icon-close"
              style="font-size: 12px; cursor: pointer"
              @click="onClose"
            />
          </span>
        </el-input>
      </div>
      <ul v-show="loading" class="zloading">
        {{ this.$t('Loading') }}...
      </ul>
      <ul v-show="!loading" :id="iZTreeID" :key="iZTreeID" class="ztree" />
      <div v-if="treeSetting.treeUrl===''" class="tree-empty">
        {{ this.$t('Empty') }}
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
import { setUrlParam } from '@/utils/common'

const defaultObject = {
  type: Object,
  default: () => ({})
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
      showTreeSearch: true,
      treeSearchValue: '',
      treeSearchType: 'asset',
      treeSearchTypeOptions: {},
      treeSearchTypeSupportOptions: {
        node: {
          label: this.$t('Node'),
          placeholder: this.$t('Search node'),
          tooltip: this.$t('Search by node name'),
          search_key: 'search_node'
        },
        asset: {
          label: this.$t('Asset'),
          placeholder: this.$t('Search asset'),
          tooltip: this.$t('Search by asset name or address'),
          search_key: 'search_asset'
        }
      },
      treeType: '' // asset | node
    }
  },
  computed: {
    treeSetting() {
      return this.setting
    },
    isSearchTypeDropdownEnabled() {
      return Object.keys(this.treeSearchTypeOptions).length > 1
    },
    currentTreeSearchType() {
      return this.treeSearchTypeOptions[this.treeSearchType]
    },
    currentTreeSearchTypeTooltip() {
      return this.currentTreeSearchType?.tooltip || ''
    },
    treeSearchTypeLabel() {
      return this.currentTreeSearchType?.label || ''
    },
    treeSearchInputPlaceholder() {
      return this.currentTreeSearchType?.placeholder || this.$t('Search')
    }
  },
  mounted() {
    window.refresh = this.refresh
    window.onSearch = this.onSearch
    this.initTreeType()
    this.initTreeSearchTypeOptions()
    this.initTree().then(() => {
      this.$nextTick(() => {
        this.updateTreeHeight()
      })
    })
    window.addEventListener('resize', this.updateTreeHeight)
  },
  beforeDestroy() {
    $.fn.zTree.destroy(this.iZTreeID)
    window.removeEventListener('resize', this.updateTreeHeight)
  },
  methods: {
    initTreeType() {
      let treeType = this.treeSetting.treeType
      if (!treeType) {
        treeType = this.treeSetting.async?.enable ? 'asset' : 'node'
      }
      this.treeType = treeType
    },
    initTreeSearchTypeOptions() {
      if (this.treeType === 'asset') {
        // 资产树支持异步搜索节点和资产
        this.treeSearchTypeOptions = this.treeSearchTypeSupportOptions
        // 默认搜索资产
        this.treeSearchType = 'asset'
      } else {
        // 节点树只支持搜索节点
        this.treeSearchTypeOptions = Object.fromEntries(
          Object.entries(this.treeSearchTypeSupportOptions)
            .filter(([key]) => key === 'node')
        )
        // 默认搜索节点
        this.treeSearchType = 'node'
      }
    },
    onSearchTypeChange(type) {
      this.treeSearchType = type
      this.focusTreeSearchInput()
    },
    focusTreeSearchInput() {
      this.$refs.treeSearchInput.focus()
    },
    onMenuClick(menu) {
      if (menu.disabled) {
        return
      }
      menu.callback()
    },
    updateTreeHeight: _.debounce(function() {
      const tree = document.getElementById(this.iZTreeID)
      if (!tree) {
        return
      }
      // 使用 dialog 的高度
      const dialogs = [...document.getElementsByClassName('el-dialog__body')]
      if (dialogs.length > 0) {
        const dialog = dialogs.find((d) => d.innerHTML.indexOf(this.iZTreeID) !== -1)
        if (dialog) {
          // 对话框内的 zTree 才需要重新计算高度
          const dialogRect = dialog.getBoundingClientRect()
          tree.style.height = `${dialogRect.height - 60}px`
          return
        }
      }
      // 使用 table 的高度
      const zTreeRect = tree.getBoundingClientRect()
      tree.style.height = `calc(100vh - ${zTreeRect.top}px - 30px - 25px)`
    }, 100),
    async initTree(refresh = false, iTreeUrl = '') {
      const vm = this
      this.loading = true
      let treeUrl = iTreeUrl
      if (!treeUrl) {
        treeUrl = this.treeSetting.treeUrl
      }
      treeUrl = setUrlParam(treeUrl, 'tree_type', this.treeType)

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
          name: this.$t('Empty')
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
    },
    onSearch() {
      this.showTreeSearch = !this.showTreeSearch
      // localStorage.setItem('showTreeSearch', JSON.stringify(this.showTreeSearch))
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
        <span style="float: right; margin-right: 10px;" class='tree-actions'>
          ${treeActions}
        </span>`
      if (rootNode) {
        const $rootNodeRef = $('#' + rootNode.tId + '_a')
        $rootNodeRef.css({ 'width': 'calc(100% - 68px)', 'overflow': 'hidden', 'text-overflow': 'ellipsis' })
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
      if (this.treeSetting.async?.enable) {
        this.searchFromServer(value)
      } else {
        this.searchFromLocal(value)
      }
    }, 600),
    getCheckedNodes: function() {
      return this.zTree.getCheckedNodes(true)
    },

    recurseParent(node) {
      const parentNode = node.getParentNode()
      if (!parentNode) {
        return []
      }
      const allParents = []
      if (parentNode) {
        allParents.push(parentNode)
        if (parentNode.pId) {
          allParents.push(...this.recurseParent(parentNode))
        }
      }
      return allParents
    },

    recurseChildren(node) {
      if (!node.isParent) {
        return []
      }
      const children = node.children
      if (!children) {
        return []
      }
      const allChildren = []
      children.forEach((n) => {
        allChildren.push(n)
        allChildren.push(...this.recurseChildren(n))
      })
      return allChildren
    },

    searchFromLocal(keyword, tree = this.zTree) {
      if (!this.zTree) return

      const searchNode = tree.getNodesByFilter((node) => node.id === 'search')
      if (searchNode) tree.removeNode(searchNode[0])

      const allNodes = tree.transformToArray(tree.getNodes())
      if (!keyword) {
        tree.showNodes(allNodes)
        tree.expandAll(false)
        return
      }

      const matchedNodes = tree.getNodesByFilter((node) => {
        return node.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1
      })

      if (matchedNodes.length < 1) {
        let name = this.$t('Search')
        const assetsAmount = matchedNodes.length
        name = `${name} (${assetsAmount})`
        const newNode = { id: 'search', name: name, isParent: false, open: false }
        const addedNodes = tree.addNodes(null, newNode)
        // 隐藏所有节点，只显示搜索节点
        tree.hideNodes(allNodes)
        tree.showNodes(addedNodes)
        return
      }

      // 获取应该展示的节点，以及应该展开的节点
      let shouldShow = []
      let shouldExpandNodes = []
      let shouldCollapseNodes = []
      matchedNodes.forEach((node) => {
        const parents = this.recurseParent(node)
        const children = this.recurseChildren(node)
        // 应该显示匹配节点本身、其祖先节点和子孙节点
        shouldShow.push(node)
        shouldShow.push(...parents)
        shouldShow.push(...children)

        // 应该展开匹配节点的父节点，不展开匹配节点的子孙节点
        shouldExpandNodes.push(...parents)
        // 应该折叠匹配节点的子孙节点
        shouldCollapseNodes.push(node)
        shouldCollapseNodes.push(...children)
      })
      shouldShow = Array.from(new Set(shouldShow))
      shouldExpandNodes = Array.from(new Set(shouldExpandNodes))
      shouldCollapseNodes = Array.from(new Set(shouldCollapseNodes))

      // 隐藏所有节点，显示应该显示的节点
      tree.hideNodes(allNodes)
      tree.showNodes(shouldShow)
      // 展开应该展开的节点
      for (const node of shouldExpandNodes) {
        tree.expandNode(node, true)
      }
      // 折叠应该折叠的节点
      for (const node of shouldCollapseNodes) {
        tree.expandNode(node, false)
      }
    },

    searchFromServer(keyword) {
      // 直接用搜索 API 返回的数据重新初始化树
      const treeUrl = this.treeSetting.searchUrl ? this.treeSetting.searchUrl : this.treeSetting.treeUrl
      const searchTypeKey = this.treeSearchTypeOptions[this.treeSearchType]?.search_key || 'search'
      const searchUrl = setUrlParam(treeUrl, searchTypeKey, keyword)
      this.initTree(true, searchUrl)
    }
  }

}
</script>

<style lang="scss" scoped>
.treebox {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 10px 10px 0 10px;

  .ztree {
    width: 100%;
    overflow: auto;
    height: 648px;
    background-color: #ffffff;

    .level0 {
      .node_name {
        max-width: 120px;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }

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

  &:hover {
    ::v-deep .tree-action-btn {
      display: inline;

      &:hover {
        box-shadow: none;
        color: var(--color-text-primary) !important;
      }
    }
  }

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

.menu-item {
  font-size: 12px;
  padding: 0 16px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #606266;
  height: 24px;
  line-height: 24px;
  box-sizing: border-box;
  cursor: pointer;

  i {
    width: 15px;
  }
}

.dropdown-menu {
  border: medium none;
  min-width: 160px;
  background-color: #fff;
  border-radius: 2px;
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
  max-height: 320px;
  min-height: 150px;
  overflow: auto;
}

.ztree ::v-deep .fa {
  font: normal normal normal 14px/1 FontAwesome !important;
}

.dropdown a:hover {
  background-color: #f1f1f1
}

.dropdown-menu > li > a {
  border-radius: 2px;
  color: inherit;
  line-height: 25px;
  margin: 4px;
  text-align: left;
  font-weight: normal;
  display: block;
  padding: 3px 20px;
  clear: both;
  white-space: nowrap;
  width: 20px;
}

.dropdown-menu > li > a:hover, .dropdown-menu > li > a:focus {
  color: #262626;
  text-decoration: none;
  background-color: #f5f5f5;
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

.refresh-btn {
  padding: 5px;
  font-size: 13px;
  font-weight: 500;
  background: inherit;
  border: none;
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
    border-radius: 2px;
    padding: 0 5px;
    box-sizing: border-box;
    overflow: hidden;
    cursor: pointer;
    background-color: #D7D8DC;

    .rotate {
      transition: all 0.8s ease-in-out;
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
  border: 1px solid;
  border-radius: 3px;

  &:hover,
  &:focus-within {
    border-color: var(--color-primary);
  }

  & ::v-deep .el-input__inner {
    border: none;
    background: #fafafa;
    padding-right: 32px;
    color: var(--color-text-primary);
  }

  & ::v-deep .el-input__suffix {
    padding-right: 8px;

    .el-input__suffix-inner:hover {
      color: var(--color-text-primary);
    }
  }

  & ::v-deep .el-input__prefix {
    display: flex;

    .el-input__icon {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  & ::v-deep .el-input__suffix-inner {
    line-height: 30px;
  }

  & ::v-deep .el-input-group__prepend {
    padding-left: 5px;
    padding-right: 3px;
    border: none;
    color: #999;
    * {
      color: inherit;
    }

    align-items: center;
    background: #fafafa;
    .el-icon-arrow-down {
      display: inline-block;
      transition: transform 0.8s ease; /* 动画关键 */
    }
    :hover {
      .el-icon-arrow-down {
        transform: rotate(180deg); /* 顺时针 180° */
      }
    }
    .search-label {
      margin-left: 1px;
      margin-right: 1px;
    }
  }
}

::v-deep .el-dropdown-menu__item.is-active {
  color: var(--color-primary);
  font-weight: 500;
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

::v-deep .tree-action-btn {
  display: none;
}

</style>
