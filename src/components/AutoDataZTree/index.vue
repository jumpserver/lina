<template>
  <DataZTree ref="dataztree" :setting="treeSetting">
    <slot slot="rMenu">
      <li id="m_create" class="rmenu" tabindex="-1"><a><i class="fa fa-plus-square-o" /> 添加资产到节点 </a></li>
      <li id="m_edit" class="rmenu" tabindex="-1" @click="editTreeNode"><a><i class="fa fa-pencil-square-o" /> 重命名节点 </a></li>
      <li id="m_del" class="rmenu" tabindex="-1" @click="removeTreeNode"><a><i class="fa fa-minus-square" /> 删除节点 </a></li>
      <slot name="rMenu" />
    </slot>
  </DataZTree>
</template>

<script>
import DataZTree from '../DataZTree'
import $ from '@/utils/jquery-vendor'
const merge = require('deepmerge')
export default {
  name: 'AutoDataZTree',
  components: {
    DataZTree
  },
  props: {
    setting: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      defaultSetting: {
        async: {
          enable: true,
          url: this.setting.showAssets ? process.env.VUE_APP_BASE_API + this.setting.treeUrl : process.env.VUE_APP_BASE_API + this.setUrlParam(this.setting.treeUrl, 'assets', '1'),
          autoParam: ['id=key', 'name=n', 'level=lv'],
          type: 'get'
        },
        callback: {
          onRightClick: this.onRightClick.bind(this),
          onRename: this.onRename.bind(this)

        }
      }
    }
  },
  computed: {
    treeSetting() {
      const treeSetting = merge(this.defaultSetting, this.setting)
      console.log(treeSetting)
      return treeSetting
    },
    zTree() {
      return this.$refs.dataztree.zTree
    },
    rMenu() {
      return this.$refs.dataztree.rMenu
    }
  },
  methods: {
    setUrlParam: function(url, name, value) {
      var urlArray = url.split('?')
      if (urlArray.length === 1) {
        url += '?' + name + '=' + value
      } else {
        var oriParam = urlArray[1].split('&')
        var oriParamMap = {}
        $.each(oriParam, function(index, value) {
          var v = value.split('=')
          oriParamMap[v[0]] = v[1]
        })
        oriParamMap[name] = value
        url = urlArray[0] + '?'
        var newParam = []
        $.each(oriParamMap, function(index, value) {
          newParam.push(index + '=' + value)
        })
        url += newParam.join('&')
      }
      return url
    },
    editTreeNode: function() {
      this.hideRMenu()
      var current_node = this.zTree.getSelectedNodes()[0]
      if (!current_node) {
        return
      }
      if (current_node) {
        current_node.name = current_node.meta.node.value
      }
      this.zTree.editName(current_node)
    },
    hideRMenu: function() {
      if (this.rMenu) this.rMenu.css({ 'visibility': 'hidden' })
      $('body').unbind('mousedown', this.onBodyMouseDown)
    },
    removeTreeNode: function() {
      this.hideRMenu()
      var currentNode = this.zTree.getSelectedNodes()[0]
      console.log(currentNode)
      if (!currentNode) {
        return
      }
      this.$axios.delete(
        `${this.nodeUrl}${currentNode.meta.node.id}/`,
      ).then(
        this.zTree.removeNode(currentNode)
      )
    },
    onRename: function(event, treeId, treeNode, isCancel) {
      console.log(event, treeId, treeNode, isCancel)
    },
    onBodyMouseDown: function(event) {
      if (!(event.target.id === 'rMenu' || $(event.target).parents('#rMenu').length > 0)) {
        this.rMenu.css({ 'visibility': 'hidden' })
      }
    },
    showRMenu: function(type, x, y) {
      var offset = $('#ztree').offset()
      var scrollTop = document.querySelector('.treebox').scrollTop
      x -= offset.left
      y -= offset.top + scrollTop
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
    }
  }
}
</script>

<style lang='less' scoped>
  .rmenu  > a {
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
  .rmenu>a:hover, .dropdown-menu>a:focus {
    color: #262626;
    text-decoration: none;
    background-color: #f5f5f5;
  }
</style>
