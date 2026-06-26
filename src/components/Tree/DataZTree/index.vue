<template>
  <ZTree v-bind="$attrs" ref="ztree" :setting="treeSetting">
    <!--Slot透传-->
    <template #rMenu>
      <slot name="rMenu" />
    </template>
  </ZTree>
</template>

<script>
import ZTree from './components/ZTree/index.vue'

export default {
  name: 'DataZTree',
  components: {
    ZTree
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
        view: {
          dblClickExpand: false,
          showLine: true
        },
        data: {
          simpleData: {
            enable: true
          }
        },
        edit: {
          enable: true,
          showRemoveBtn: false,
          showRenameBtn: false,
          drag: {
            isCopy: false,
            isMove: !this.$store.getters.currentOrgIsRoot
          }
        },
        callback: {
          onRightClick: this.defaultCallback.bind(this, 'onRightClick'),
          onRename: this.defaultCallback.bind(this, 'onRename'),
          beforeClick: this.defaultCallback.bind(this, 'beforeClick'),
          onSelected: this.defaultCallback.bind(this, 'onSelected'),
          beforeDrag: this.defaultCallback.bind(this, 'beforeDrag'),
          onDrag: this.defaultCallback.bind(this, 'onDrag'),
          beforeDrop: this.defaultCallback.bind(this, 'beforeDrop'),
          onDrop: this.defaultCallback.bind(this, 'onDrop'),
          beforeAsync: this.defaultCallback.bind(this, 'beforeAsync'),
          refresh: this.defaultCallback.bind(this, 'refresh')
        }
      }
    }
  },
  computed: {
    treeSetting() {
      // merge 到新对象,避免就地修改响应式 this.defaultSetting 造成计算属性自触发循环
      return _.merge({}, this.defaultSetting, this.setting)
    },
    zTree() {
      return this.$refs.ztree.zTree
    },
    rMenu() {
      return this.$refs.ztree.rMenu
    },
    refresh() {
      return this.$refs.ztree.refresh
    }
  },
  methods: {
    defaultCallback: function (action) {
      // debug(action)
    }
  }
}
</script>
