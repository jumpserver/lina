<template>
  <div>
    <div class="treebox">
      <ul id="ztree" class="ztree" />
    </div>
    <div id="rMenu">
      <ul class="dropdown-menu menu-actions">
        <li class="divider" />
        <li id="m_create" tabindex="-1" @click="addTreeNode"><a><i class="fa fa-plus-square-o" /> 添加资产到节点 </a></li>
        <li id="m_edit" tabindex="-1" @click="editTreeNode"><a><i class="fa fa-pencil-square-o" /> 重命名节点 </a></li>
        <li id="m_del" tabindex="-1" @click="removeTreeNode"><a><i class="fa fa-minus-square" /> 删除节点 </a></li>
      </ul>
    </div>
  </div>
</template>

<script>
// 导入JQuery
// eslint-disable-next-line no-unused-vars
import $ from '@/utils/jquery-vendor.js'
import 'ztree'
import 'ztree/css/metroStyle/metroStyle.css'
const defaultFunction = {
  type: Function,
  default: () => {}
}
const defaultString = {
  type: String,
  default: () => {}
}
const defaultBoolean = {
  type: Boolean,
  default: () => true
}
const defaultArray = {
  type: Array,
  default: () => []
}
export default {
  name: 'ZTree',
  components: {

  },
  props: {
    url: defaultString,
    treeUrl: defaultString,
    // treeNodeUrl: defaultString,
    showAssets: defaultBoolean,
    showMenu: defaultBoolean,
    // 额外右侧菜单
    otherMenu: defaultArray,
    onRightClick: defaultFunction,
    beforeClick: defaultFunction,
    onRename: defaultFunction,
    beforeDrag: defaultFunction,
    onDrag: defaultFunction,
    beforeDrop: defaultFunction,
    onDrop: defaultFunction,
    beforeAsync: defaultFunction,
    onSelected: defaultFunction
  },
  data() {
    return {
      setting: {
        view: {
          dblClickExpand: false,
          showLine: true
        },
        data: {
          simpleData: {
            enable: true
          }
        },
        async: {
          enable: true,
          url: this.showAssets ? process.env.VUE_APP_BASE_API + this.treeUrl : process.env.VUE_APP_BASE_API + this.setUrlParam(this.treeUrl, 'assets', '1'),
          autoParam: ['id=key', 'name=n', 'level=lv'],
          type: 'get'
        },
        edit: {
          enable: true,
          showRemoveBtn: false,
          showRenameBtn: false,
          drag: {
            isCopy: true,
            isMove: true
          }
        },
        callback: {
          onRightClick: this.OnRightClick || this.defaultOnRightClick,
          beforeClick: this.beforeClick || this.defaultBeforeClick,
          onRename: this.onRename || this.defaultOnRename,
          onSelected: this.onSelected || this.defaultCallback('On selected'),
          beforeDrag: this.beforeDrag || this.defaultCallback('On selected'),
          onDrag: this.onDrag || this.defaultOnDrop('On selected'),
          beforeDrop: this.beforeDrop || this.defaultBeforeDrop,
          onDrop: this.onDrop || this.defaultOnDrop,
          beforeAsync: this.beforeAsync || this.defaultCallback('Before async')
        }
      },
      zTree: '',
      rMenu: ''
    }
  },
  computed() {

  },
  mounted() {
    this.initTree()
    $('.treebox').css('height', window.innerHeight - 60)
  },
  methods: {
    initTree: function() {
      this.$axios.get(this.treeUrl).then(res => {
        this.zTree = $.fn.zTree.init($('#ztree'), this.setting, res)
        this.rootNodeAddDom(
          this.zTree,
          () => {
            this.$axios.post(
              '/api/v1/assets/nodes/00000000-0000-0000-0000-000000000000/tasks/',
              { action: 'refresh_cache' }
            ).then(res => {
              this.initTree()
            }
            )
          }
        )
        if (this.showMenu) {
          this.rMenu = $('#rMenu')
        }
        if (this.otherMenu) {
          $('.menu-actions').append(this.otherMenu)
        }
      })
    },
    rootNodeAddDom: function(ztree, callback) {
      var refreshIcon = "<a id='tree-refresh'><i class='fa fa-refresh'></i></a>"
      var rootNode = ztree.getNodes()[0]
      if (rootNode) {
        var $rootNodeRef = $('#' + rootNode.tId + '_a')
        $rootNodeRef.after(refreshIcon)
      } else {
        $rootNodeRef = $('#' + ztree.setting.treeId)
        $rootNodeRef.html(refreshIcon)
      }
      var refreshIconRef = $('#tree-refresh')
      refreshIconRef.bind('click', function() {
        ztree.destroy()
        callback()
      })
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
    defaultCallback: function(action) {
      console.log(action)
    },
    defaultOnRightClick: function(event, treeId, treeNode) {
      if (!this.showMenu) {
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
    defaultBeforeClick: function(treeId, treeNode, clickFlag) {
      return true
    },
    defaultOnDrop: function(event, treeId, treeNodes, targetNode, moveType) {
      var treeNodesIds = []
      $.each(treeNodes, function(index, value) {
        treeNodesIds.push(value.meta.node.id)
      })

      // var the_url = "{% url 'api-assets:node-add-children' pk=DEFAULT_PK %}".replace('{{ DEFAULT_PK }}', targetNode.meta.node.id)
      // var body = { nodes: treeNodesIds }
      // TODO
      this.$axios.put(

      )
    },
    // TODO
    defaultOnRename: function(treeId, treeNode, clickFlag) {
      return true
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
    onBodyMouseDown: function(event) {
      if (!(event.target.id === 'rMenu' || $(event.target).parents('#rMenu').length > 0)) {
        this.rMenu.css({ 'visibility': 'hidden' })
      }
    },
    hideRMenu: function() {
      if (this.rMenu) this.rMenu.css({ 'visibility': 'hidden' })
      $('body').unbind('mousedown', this.onBodyMouseDown)
    },
    defaultBeforeDrop: function(treeId, treeNodes, targetNode, moveType) {
      var treeNodesNames = []
      $.each(treeNodes, function(index, value) {
        treeNodesNames.push(value.name)
      })

      var msg = '你想移动节点: `' + treeNodesNames.join(',') + '` 到 `' + targetNode.name + '` 下吗?'
      return confirm(msg)
    },
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
    removeTreeNode: function() {
      this.hideRMenu()
      var current_node = this.zTree.getSelectedNodes()[0]
      if (!current_node) {
        return
      }
      // var url = "{% url 'api-assets:node-detail' pk=DEFAULT_PK %}".replace('{{ DEFAULT_PK }}', current_node_id)
      // requestApi({
      //   url: url,
      //   method: 'DELETE',
      //   success: function() {
      //     zTree.removeNode(current_node)
      //   }
      // })
    }
  }

}
</script>

<style lang='less' scoped>
  div#rMenu {
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
  div#rMenu li{
    margin: 1px 0;
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
  .ztree /deep/ .fa-refresh {
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
</style>
