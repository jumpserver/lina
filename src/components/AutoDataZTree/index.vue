<template>
  <DataZTree ref="dataztree" :setting="treeSetting">
    <slot slot="rMenu">
      <li id="m_create" class="rmenu" tabindex="-1" @click="createTreeNode">
        <i class="fa fa-plus-square-o" />  {{ this.$t('tree.CreateNode') }}
      </li>
      <li id="m_edit" class="rmenu" tabindex="-1" @click="editTreeNode">
        <i class="fa fa-pencil-square-o" />  {{ this.$t('tree.RenameNode') }}
      </li>
      <li id="m_del" class="rmenu" tabindex="-1" @click="removeTreeNode">
        <i class="fa fa-minus-square" />  {{ this.$t('tree.DeleteNode') }}
      </li>
      <li class="divider" />
      <li id="m_add_asset_to_node" class="rmenu" tabindex="-1" @click="addAssetToNode">
        <i class="fa fa-clone" />  {{ this.$t('tree.AddAssetToNode') }}
      </li>
      <li id="m_move_asset_to_node" class="rmenu" tabindex="-1" @click="moveAssetToNode">
        <i class="fa fa-scissors" />  {{ this.$t('tree.moveAssetToNode') }}
      </li>
      <li class="divider" />
      <li id="m_update_node_asset_hardware_info" class="rmenu" tabindex="-1" @click="updateNodeAssetHardwareInfo">
        <i class="fa fa-refresh" />  {{ this.$t('tree.updateNodeAssetHardwareInfo') }}
      </li>
      <li id="m_test_node_asset_connectivity" class="rmenu" tabindex="-1" @click="testNodeAssetConnectivity">
        <i class="fa fa-link" />  {{ this.$t('tree.testNodeAssetConnectivity') }}
      </li>
      <li class="divider" />
      <li id="m_show_asset_only_current_node" class="rmenu" tabindex="-1" @click="showAssetOnlyCurrentNode">
        <i class="fa fa-indent" />  {{ this.$t('tree.showAssetOnlyCurrentNode') }}
      </li>
      <li id="m_show_asset_all_children_node" class="rmenu" tabindex="-1" @click="showAssetAllChildrenNode">
        <i class="fa fa-align-justify" />  {{ this.$t('tree.showAssetAllChildrenNode') }}
      </li>
      <li class="divider" />
      <li id="m_show_node_info" class="rmenu" tabindex="-1" @click="showNodeInfo">
        <i class="fa fa-info-circle" />  {{ this.$t('tree.showNodeInfo') }}
      </li>
      <slot name="rMenu" />
    </slot>
  </DataZTree>
</template>

<script>
import DataZTree from '../DataZTree'
import $ from '@/utils/jquery-vendor'

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
        async: {
          enable: true,
          url: (process.env.VUE_APP_ENV === 'production') ? (`${this.setting.treeUrl}`) : (`${process.env.VUE_APP_BASE_API}${this.setting.treeUrl}`),
          autoParam: ['id=key', 'name=n', 'level=lv'],
          type: 'get',
          headers: {
            'X-JMS-ORG': JSON.parse(this.$cookie.get('jms_current_org')).id || ''
          }
        },
        callback: {
          onRightClick: this.onRightClick.bind(this),
          onRename: this.onRename.bind(this),
          onSelected: this.onSelected.bind(this),
          beforeDrop: this.beforeDrop.bind(this),
          onDrop: this.onDrop.bind(this),
          refresh: this.refresh.bind(this)
          // 尚未定义的函数
          // beforeClick
          // beforeDrag
          // onDrag
          // beforeAsync: this.defaultCallback.bind(this, 'beforeAsync')
        }
      },
      currentNode: '',
      currentNodeId: ''
    }
  },
  computed: {
    treeSetting() {
      return _.merge(this.defaultSetting, this.setting)
    },
    zTree() {
      return this.$refs.dataztree.zTree
    },
    rMenu() {
      return this.$refs.dataztree.rMenu
    }
  },
  mounted() {

  },
  methods: {
    editTreeNode: function() {
      this.hideRMenu()
      const currentNode = this.zTree.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      if (currentNode) {
        currentNode.name = currentNode.meta.node.value
      }
      this.zTree.editName(currentNode)
    },
    hideRMenu: function() {
      if (this.rMenu) this.rMenu.css({ 'visibility': 'hidden' })
      $('body').unbind('mousedown', this.onBodyMouseDown)
    },
    // Request URL: http://localhost/api/v1/assets/assets/?node_id=d8212328-538d-41a6-bcfd-1e8cc7e3aed4&show_current_asset=null&draw=2&limit=15&offset=0&_=1587022917769
    onSelected: function(event, treeNode) {
      if (treeNode.meta.type === 'node') {
        this.currentNode = treeNode
        this.currentNodeId = treeNode.meta.node.id
        this.$emit('urlChange', `${this.setting.url}?node_id=${treeNode.meta.node.id}&show_current_asset=null`)
      } else if (treeNode.meta.type === 'asset') {
        this.$emit('urlChange', `${this.setting.url}?asset_id=${treeNode.meta.asset.id}&show_current_asset=null`)
      }
    },
    removeTreeNode: function() {
      this.hideRMenu()
      const currentNode = this.zTree.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$axios.delete(
        `${this.treeSetting.nodeUrl}${currentNode.meta.node.id}/`
      ).then(() => {
        this.$message.success(this.$t('common.deleteSuccessMsg'))
        this.zTree.removeNode(currentNode)
      }).catch(error => {
        this.$message.error(this.$t('common.deleteErrorMsg' + ' ' + error))
      })
    },
    addAssetToNode: function() {

    },
    moveAssetToNode: function() {

    },
    updateNodeAssetHardwareInfo: function() {

    },
    testNodeAssetConnectivity: function() {

    },
    showNodeInfo: function() {

    },
    showAssetOnlyCurrentNode: function() {

    },
    showAssetAllChildrenNode: function() {

    },
    onRename: function(event, treeId, treeNode, isCancel) {
      const url = `${this.treeSetting.nodeUrl}${this.currentNodeId}/`
      if (isCancel) {
        return
      }
      this.$axios.patch(
        url,
        { 'value': treeNode.name }
      ).then(res => {
        let assetsAmount = treeNode.meta.node.assetsAmount
        if (!assetsAmount) {
          assetsAmount = 0
        }
        treeNode.name = treeNode.name + ' (' + assetsAmount + ')'
        this.zTree.updateNode(treeNode)
        this.$message.success(this.$t('common.updateSuccessMsg'))
      }).catch(error => {
        this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
      })
    },
    onBodyMouseDown: function(event) {
      if (!(event.target.id === 'rMenu' || $(event.target).parents('#rMenu').length > 0)) {
        this.rMenu.css({ 'visibility': 'hidden' })
      }
    },
    showRMenu: function(type, x, y) {
      const offset = $('#ztree').offset()
      const scrollTop = document.querySelector('.treebox').scrollTop
      x -= offset.left
      // Tmp
      y -= (offset.top + scrollTop) / 3 - 10
      x += document.body.scrollLeft
      y += document.body.scrollTop + document.documentElement.scrollTop
      this.rMenu.css({ 'top': y + 'px', 'left': x + 'px', 'visibility': 'visible' })
      $('#rMenu ul').show()
      $('body').bind('mousedown', this.onBodyMouseDown)
    },
    onRightClick: function(event, treeId, treeNode) {
      if (!this.setting.showMenu) {
        return
      }
      if (!treeNode && event.target.tagName.toLowerCase() !== 'button' && $(event.target).parents('a').length === 0) {
        this.zTree.cancelSelectedNode()
        this.showRMenu('root', event.clientX, event.clientY)
      } else if (treeNode && !treeNode.noR) {
        this.zTree.selectNode(treeNode)
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
        treeNodesIds.push(value.meta.node.id)
      })
      const theUrl = `${this.treeSetting.nodeUrl}${targetNode.meta.node.id}/children/add/`
      this.$axios.put(
        theUrl, {
          nodes: treeNodesIds
        }
      ).then((res) => {
        this.$message.success(this.$t('common.updateSuccessMsg'))
      }).catch(error => {
        this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
      })
    },
    createTreeNode: function() {
      this.hideRMenu()
      const parentNode = this.zTree.getSelectedNodes()[0]
      if (!parentNode) {
        return
      }
      // http://localhost/api/v1/assets/nodes/85aa4ee2-0bd9-41db-9079-aa3646448d0c/children/
      const url = `${this.treeSetting.nodeUrl}${parentNode.meta.node.id}/children/`
      this.$axios.post(
        url, {}
      ).then(data => {
        const newNode = {
          id: data['key'],
          name: data['value'],
          pId: parentNode.id,
          meta: {
            'node': data
          }
        }
        newNode.checked = this.zTree.getSelectedNodes()[0].checked
        this.zTree.addNodes(parentNode, 0, newNode)
        // vm.$refs.dataztree.refresh()
        const node = this.zTree.getNodeByParam('id', newNode.id, parentNode)
        this.currentNodeId = node.meta.node.id || newNode.id
        this.zTree.editName(node)
        this.$message.success(this.$t('common.updateSuccessMsg'))
      }).catch(error => {
        this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
      })
    },
    refresh: function() {
      this.$axios.post(
        '/api/v1/assets/nodes/00000000-0000-0000-0000-000000000000/tasks/',
        { action: 'refresh_cache' }
      )
    },
    getSelectedNodes: function() {
      return this.zTree.getSelectedNodes()
    }
  }
}
</script>

<style lang='less' scoped>
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
  .rmenu:hover{
    background-color: #f5f7fa;
  }

  .divider{
    margin: 1px 0;
    list-style: none outside none;
    background-color: #e5e5e5;
    height: 1px
  }
</style>
