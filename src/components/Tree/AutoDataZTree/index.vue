<template>
  <DataZTree ref="dataztree" :setting="treeSetting" class="data-z-tree" v-on="$listeners">
    <slot slot="rMenu">
      <div v-if="menu && menu.length > 0">
        <span v-for="item in menu" :key="item.id">
          <li
            v-if="hasMenuItem(item)"
            :id="item.id"
            :key="item.id"
            :class="{ 'disabled': checkDisabled(item) }"
            class="rmenu"
            tabindex="-1"
            @click="onMenuItemClick(item)"
          >
            <Icon :icon="item.icon" class="icon" /> {{ item.name }}
          </li>
          <li v-if="item.divided" class="divider" />
        </span>
      </div>
      <slot name="rMenu" />
    </slot>
  </DataZTree>
</template>

<script>
import DataZTree from '../DataZTree/index.vue'
import Icon from '@/components/Widgets/Icon'
import $ from '@/utils/jquery-vendor'
import { mapGetters } from 'vuex'

export default {
  name: 'AutoDataZTree',
  components: {
    DataZTree,
    Icon
  },
  props: {
    setting: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      defaultMenu: [
        {
          id: 'm_create',
          name: this.$t('CreateNode'),
          icon: 'fa-plus-square-o',
          callback: this.createTreeNode,
          has: () => this.setting.showCreate
        },
        {
          id: 'm_edit',
          name: this.$t('RenameNode'),
          icon: 'fa-pencil-square-o',
          callback: this.editTreeNode,
          has: () => this.setting.showUpdate
        },
        {
          id: 'm_del',
          name: this.$t('DeleteNode'),
          icon: 'fa-minus-square',
          callback: this.removeTreeNode,
          has: () => this.setting.showDelete
        }
      ],
      defaultSetting: {
        showDefaultMenu: true,
        showMenu: false,
        showCreate: true,
        showDelete: true,
        showUpdate: true,
        showSearch: false,
        customTreeHeaderName: this.$t('AssetTree'),
        selectSyncToRoute: true,
        async: {
          enable: true,
          url: (process.env.VUE_APP_ENV === 'production')
            ? (`${this.setting.treeUrl}`)
            : (`${process.env.VUE_APP_BASE_API}${this.setting.treeUrl}`),
          autoParam: ['id=key', 'name=n', 'level=lv'],
          type: 'get',
          headers: {
            'X-JMS-ORG': this.$store.getters.currentOrg ? this.$store.getters.currentOrg.id : ''
          }
        },
        callback: {
          onRightClick: this.onRightClick.bind(this),
          onRename: this.onRename.bind(this),
          onSelected: this.onSelected.bind(this),
          beforeDrop: this.beforeDrop.bind(this),
          onDrop: this.onDrop.bind(this),
          refresh: this.refresh.bind(this),
          onAsyncSuccess: this.onAsyncSuccess.bind(this)
        },
        hasRightMenu: true
      },
      currentNode: '',
      currentNodeId: ''
    }
  },
  computed: {
    ...mapGetters([
      'currentOrg'
    ]),
    treeSetting() {
      this.$log.debug('Settings: ', this.setting)
      return _.merge(this.defaultSetting, this.setting)
    },
    zTree() {
      return this.$refs.dataztree.zTree
    },
    rMenu() {
      return this.$refs.dataztree.rMenu
    },
    menu() {
      let menu = []
      if (this.setting.showDefaultMenu) {
        menu = menu.concat(this.defaultMenu)
      }
      if (this.setting.menu && this.setting.menu.length > 0) {
        menu = menu.concat(this.setting.menu)
      }
      return menu
    }
  },
  beforeDestroy() {
    $('body').unbind('mousedown')
  },
  methods: {
    checkDisabled(item) {
      let disabled = item.disabled
      if (typeof disabled === 'function') {
        disabled = disabled(this.currentNode)
      }
      if (typeof disabled === 'undefined') {
        disabled = false
      }
      return disabled
    },
    hasMenu(node) {
      return false
    },
    hasMenuItem(item) {
      let has = item.has
      if (typeof has === 'function') {
        has = has(this.currentNode)
      }
      if (typeof has === 'undefined') {
        has = true
      }
      return has
    },
    onMenuItemClick(item) {
      item.callback(this.currentNode)
      this.hideRMenu()
    },
    onAsyncSuccess(event, treeId, treeNode, msg) {
      const nodes = JSON.parse(msg)
      nodes.forEach((node) => {
        if (treeNode.checked) {
          const currentNode = this.zTree.getNodeByParam('id', node.id, null)
          currentNode.checked = true
          this.zTree.updateNode(currentNode)
        }
      })
    },
    refreshTree: function() {
      // const refreshIconRef = $('#tree-refresh')
      // refreshIconRef.click()
    },
    editTreeNode: function() {
      this.hideRMenu()
      const currentNode = this.zTree.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      if (currentNode) {
        // 从节点名称中提取资产数量并保存
        const nameMatch = currentNode.name.match(/^(.+?)\s*\((\d+)\)$/)

        if (nameMatch) {
          const pureName = nameMatch[1]
          const assetsAmount = parseInt(nameMatch[2])

          currentNode.name = pureName
          currentNode.meta.data['assetsAmount'] = assetsAmount // 保存资产数量，确保重命名时不会丢失
        } else {
          currentNode.name = currentNode.meta.data.value
        }
      }
      this.zTree.editName(currentNode)
    },
    hideRMenu: function() {
      if (this.rMenu) this.rMenu.css({ 'visibility': 'hidden' })
      $('body').unbind('mousedown', this.onBodyMouseDown)
    },
    // Request URL: http://localhost/api/v1/assets/assets/?node_id=ID&show_current_asset=null&draw=2&limit=15&offset=0&_=1587022917769
    onSelected: function(event, treeNode) {
      const show_current_asset = this.$cookie.get('show_current_asset') || '0'
      if (!this.setting.url) {
        return
      }
      let combinator = '?'
      if (this.setting.url.indexOf('?') !== -1) {
        combinator = '&'
      }
      let url = ''
      const query = { ...this.$route.query }
      const objectId = treeNode.meta.data.id
      if (treeNode.meta.type === 'node') {
        this.currentNode = treeNode
        this.currentNodeId = treeNode.meta.data.id
        query['node'] = this.currentNodeId
        query['asset'] = ''
        url = `${this.setting.url}${combinator}node_id=${objectId}&show_current_asset=${show_current_asset}`
      } else if (treeNode.meta.type === 'asset') {
        query['asset'] = treeNode.meta.data?.id || treeNode.id
        query['node'] = ''
        url = `${this.setting.url}${combinator}asset_id=${query.asset}&show_current_asset=${show_current_asset}`
      }
      if (this.setting.selectSyncToRoute) {
        this.$router.push({ query })
      }
      this.$emit('urlChange', url)
    },
    removeTreeNode: function() {
      this.hideRMenu()
      const currentNode = this.zTree.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$axios.delete(
        `${this.treeSetting.nodeUrl}${currentNode.meta.data.id}/`
      ).then(() => {
        this.$message.success(this.$tc('DeleteSuccessMsg'))
        this.zTree.removeNode(currentNode)
        this.refreshTree()
      }).catch(() => {
        // this.$message.error(this.$tc('DeleteErrorMsg') + ' ' + error)
      })
    },
    onRename: function(event, treeId, treeNode, isCancel) {
      const currentNodeId = this.currentNodeId || treeNode.meta.data?.id || ''
      const url = `${this.treeSetting.nodeUrl}${currentNodeId}/`
      if (isCancel) {
        return
      }

      const originalAssetsAmount = treeNode.meta.data['assetsAmount'] || 0

      this.$axios.patch(url, { 'value': treeNode.name }).then(res => {
        treeNode.name = treeNode.name + ' (' + originalAssetsAmount + ')'
        treeNode.meta.data = Object.assign({}, treeNode.meta.data, res)
        treeNode.meta.data['assetsAmount'] = originalAssetsAmount

        this.zTree.updateNode(treeNode)
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      }).finally(() => {
        this.refreshTree()
      })
    },
    onBodyMouseDown: function(event) {
      const rMenuID = this.$refs.dataztree.$refs.ztree.iRMenuID
      if (!(event.target.id === 'rMenu' || $(event.target).parents(`#${rMenuID}`).length > 0)) {
        this.rMenu.css({ 'visibility': 'hidden' })
      }
    },
    showRMenu: function(type, x, y) {
      const rMenuID = this.$refs.dataztree.$refs.ztree.iRMenuID
      const zTreeID = this.$refs.dataztree.$refs.ztree.iZTreeID
      const offset = $(`#${zTreeID}`).offset()
      const scrollTop = document.querySelector('.treebox')?.scrollTop
      x -= offset.left
      x = x < 0 ? 0 : x

      // Tmp
      y -= (offset.top + scrollTop) / 3 - 10
      x += document.body.scrollLeft
      y += document.body.scrollTop + document.documentElement.scrollTop

      if (y + $(`#${rMenuID} ul`).height() >= window.innerHeight) {
        y -= $(`#${rMenuID} ul`).height()
      }
      y = y < 0 ? 0 : y

      this.rMenu.css({ 'top': y + 'px', 'left': x + 'px', 'visibility': 'visible' })
      $(`#${rMenuID} ul`).show()
      $('body').bind('mousedown', this.onBodyMouseDown)
    },
    onRightClick: function(event, treeId, treeNode) {
      let showMenu = this.setting.showMenu
      if (typeof showMenu === 'function') {
        showMenu = showMenu(treeNode)
      }
      if (!showMenu) {
        return
      }
      if (!treeNode) {
        return
      }
      this.currentNode = treeNode
      this.currentNodeId = treeNode.meta.data.id
      // 屏蔽收藏资产
      if (treeNode?.id === '-12') {
        return
      }
      if (!treeNode && event.target.tagName.toLowerCase() !== 'button' && $(event.target).parents('a').length === 0) {
        this.zTree.cancelSelectedNode()
        this.showRMenu('root', event.clientX, event.clientY)
      } else if (treeNode && !treeNode.noR) {
        this.zTree.selectNode(treeNode)
        if (treeNode.meta?.data?.id) {
          this.currentNodeId = treeNode.meta.data.id
        }
        this.showRMenu('node', event.clientX, event.clientY)
      }
    },
    beforeDrop: function(treeId, treeNodes, targetNode, moveType) {
      const treeNodesNames = []
      $.each(treeNodes, function(index, value) {
        treeNodesNames.push(value.name)
      })
      if (!targetNode) {
        return false
      }
      // TODO 修改默认确认框
      const msg = this.$t('DropConfirmMsg', { src: treeNodesNames.join(','), dst: targetNode.name })
      return confirm(msg)
    },
    onDrop: function(event, treeId, treeNodes, targetNode, moveType) {
      const treeNodesIds = []
      $.each(treeNodes, function(index, value) {
        treeNodesIds.push(value.meta.data.id)
      })
      const theUrl = `${this.treeSetting.nodeUrl}${targetNode.meta.data.id}/children/add/`
      this.$axios.put(
        theUrl, {
          nodes: treeNodesIds
        }
      ).then((res) => {
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      }).catch(error => {
        this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + error))
      }).finally()
    },
    createTreeNode: function() {
      this.hideRMenu()
      const parentNode = this.zTree.getSelectedNodes()[0]
      if (!parentNode) {
        return
      }
      this.zTree.expandNode(parentNode, true, false, true, false)
      // http://localhost/api/v1/assets/nodes/85aa4ee2-0bd9-41db-9079-aa3646448d0c/children/
      const url = `${this.treeSetting.nodeUrl}${parentNode.meta.data.id}/children/`
      this.$axios.post(url, {}).then(data => {
        const newNode = {
          id: data['key'],
          name: data['value'],
          pId: parentNode.id,
          isParent: true,
          meta: {
            data: data,
            type: 'node'
          }
        }
        newNode.checked = this.zTree.getSelectedNodes()[0].checked
        this.zTree.addNodes(parentNode, 0, newNode)
        const node = this.zTree.getNodeByParam('id', newNode.id, parentNode)
        this.currentNodeId = node.meta.data.id || newNode.id
        this.zTree.editName(node)
        this.$message.success(this.$tc('CreateSuccessMsg'))
      }).catch(error => {
        this.$message.error(this.$tc('CreateErrorMsg') + ' ' + error)
      })
    },
    refresh: function() {
    },
    getSelectedNodes: function() {
      return this.zTree.getSelectedNodes()
    },
    getNodes: function() {
      return this.zTree.getNodes()
    },
    selectNode: function(node) {
      return this.zTree.selectNode(node)
    }
  }
}
</script>

<style scoped>
.rmenu {
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
}

.rmenu > a:hover, .dropdown-menu > a:focus {
  color: #262626;
  text-decoration: none;
  background-color: #f5f5f5;
}

.rmenu:hover {
  background-color: #f5f7fa;
}

.icon {
  width: 15px;
  display: inline-block;
}

.data-z-tree :deep(.icon) {
  width: 10px;
  margin-right: 3px;
}
</style>
