<template>
  <div>
    <div class="treebox">
      <ul id="ztree" class="ztree">
        {{ this.$t('common.tree.Loading') }}...
      </ul>
    </div>
    <div id="rMenu">
      <ul class="dropdown-menu menu-actions">
        <li class="divider" />
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
import '@/styles/ztree.css'

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
      zTree: '',
      rMenu: ''
    }
  },
  computed: {
    treeSetting() {
      return this.setting
    }
  },
  mounted() {
    this.initTree()
    // $('.treebox').css('height', window.innerHeight - 60)
  },
  methods: {
    initTree: function() {
      this.$axios.get(this.treeSetting.treeUrl).then(res => {
        if (!res) {
          res = []
        }
        if (res.length === 0) {
          res.push({
            name: this.$t('common.tree.Empty')
          })
        }
        console.log(this.treeSetting)
        this.zTree = $.fn.zTree.init($('#ztree'), this.treeSetting, res)
        if (this.treeSetting.showRefresh) {
          this.rootNodeAddDom(
            this.zTree,
            this.treeSetting.callback.refresh
          )
        }

        if (this.treeSetting.showMenu) {
          this.rMenu = $('#rMenu')
        }
        if (this.treeSetting.otherMenu) {
          $('.menu-actions').append(this.otherMenu)
        }
      })
    },
    rootNodeAddDom: function(ztree, callback) {
      const vm = this
      const refreshIcon = "<a id='tree-refresh'><i class='fa fa-refresh'></i></a>"
      const rootNode = ztree.getNodes()[0]
      let $rootNodeRef
      if (rootNode) {
        $rootNodeRef = $('#' + rootNode.tId + '_a')
        $rootNodeRef.after(refreshIcon)
      } else {
        $rootNodeRef = $('#' + ztree.setting.treeId)
        $rootNodeRef.html(refreshIcon)
      }
      const refreshIconRef = $('#tree-refresh')
      refreshIconRef.bind('click', function() {
        ztree.destroy()
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
