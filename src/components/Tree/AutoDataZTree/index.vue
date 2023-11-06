<template>
  <DataZTree ref="dataztree" :setting="treeSetting" class="data-z-tree" v-on="$listeners">
    <slot v-if="treeSetting.hasRightMenu" slot="rMenu">
      <li v-if="treeSetting.showCreate" id="m_create" class="rmenu" tabindex="-1" @click="createTreeNode">
        <i class="fa fa-plus-square-o" /> {{ this.$t('tree.CreateNode') }}
      </li>
      <li v-if="treeSetting.showUpdate" id="m_edit" class="rmenu" tabindex="-1" @click="editTreeNode">
        <i class="fa fa-pencil-square-o" /> {{ this.$t('tree.RenameNode') }}
      </li>
      <li v-if="treeSetting.showDelete" id="m_del" class="rmenu" tabindex="-1" @click="removeTreeNode">
        <i class="fa fa-minus-square" /> {{ this.$t('tree.DeleteNode') }}
      </li>
      <slot name="rMenu" />
    </slot>
  </DataZTree>
</template>

<script>
import DataZTree from '../DataZTree/index.vue'
import $ from '@/utils/jquery-vendor'
import { mapGetters } from 'vuex'

export default {
  name: 'AutoDataZTree',
  components: {
    DataZTree
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
      defaultSetting: {
        showCreate: true,
        showDelete: true,
        showUpdate: true,
        showSearch: false,
        customTreeHeaderName: this.$t('assets.AssetTree'),
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
          // 尚未定义的函数
          // beforeClick
          // beforeDrag
          // onDrag
          // beforeAsync: this.defaultCallback.bind(this, 'beforeAsync')
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
    }
  },
  beforeDestroy() {
    $('body').unbind('mousedown')
  },
  methods: {
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
        currentNode.name = currentNode.meta.data.value
      }
      this.zTree.editName(currentNode)
    },
    hideRMenu: function() {
      if (this.rMenu) this.rMenu.css({ 'visibility': 'hidden' })
      $('body').unbind('mousedown', this.onBodyMouseDown)
    },
    // Request URL: http://localhost/api/v1/assets/assets/?node_id=d8212328-538d-41a6-bcfd-1e8cc7e3aed4&show_current_asset=null&draw=2&limit=15&offset=0&_=1587022917769
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
      const query = Object.assign({}, this.$route.query)
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
      this.$router.push({ query })
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
        this.$message.success(this.$tc('common.deleteSuccessMsg'))
        this.zTree.removeNode(currentNode)
        this.refreshTree()
      }).catch(() => {
        // this.$message.error(this.$tc('common.deleteErrorMsg') + ' ' + error)
      })
    },
    onRename: function(event, treeId, treeNode, isCancel) {
      const currentNodeId = this.currentNodeId || treeNode.meta.data?.id || ''
      const url = `${this.treeSetting.nodeUrl}${currentNodeId}/`
      if (isCancel) {
        return
      }
      this.$axios.patch(url, { 'value': treeNode.name }).then(res => {
        let assetsAmount = treeNode.meta.data['assetsAmount']
        if (!assetsAmount) {
          assetsAmount = 0
        }
        treeNode.name = treeNode.name + ' (' + assetsAmount + ')'
        treeNode.meta.data = res
        this.zTree.updateNode(treeNode)
        this.$message.success(this.$tc('common.updateSuccessMsg'))
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
      // Tmp
      y -= (offset.top + scrollTop) / 3 - 10
      x += document.body.scrollLeft
      y += document.body.scrollTop + document.documentElement.scrollTop

      if (y + $(`#${rMenuID} ul`).height() >= window.innerHeight) {
        y -= $(`#${rMenuID} ul`).height()
      }

      this.rMenu.css({ 'top': y + 'px', 'left': x + 'px', 'visibility': 'visible' })
      $(`#${rMenuID} ul`).show()
      $('body').bind('mousedown', this.onBodyMouseDown)
    },
    onRightClick: function(event, treeId, treeNode) {
      if (!this.setting.showMenu) {
        return
      }
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
      const msg = this.$t('common.tree.DropConfirmMsg', { src: treeNodesNames.join(','), dst: targetNode.name })
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
        this.$message.success(this.$tc('common.updateSuccessMsg'))
      }).catch(error => {
        this.$message.error(this.$tc('common.updateErrorMsg' + ' ' + error))
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
        this.$message.success(this.$tc('common.createSuccessMsg'))
      }).catch(error => {
        this.$message.error(this.$tc('common.createErrorMsg') + ' ' + error)
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

.data-z-tree >>> .fa {
  width: 10px;
  margin-right: 3px;
}
</style>
