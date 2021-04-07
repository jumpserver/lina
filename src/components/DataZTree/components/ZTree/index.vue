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
  .ztree  ::v-deep  .fa-refresh {
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
</style>
