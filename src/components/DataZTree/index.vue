<template>
  <ZTree ref="ztree" :setting="treeSetting">
    <!--Slot透传-->
    <div slot="rMenu" slot-scope="{data}">
      <slot name="rMenu" :data="data" />
    </div>
  </ZTree>
</template>

<script>
import ZTree from './components/ZTree'
const merge = require('deepmerge')
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
            isCopy: true,
            isMove: true
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
          beforeAsync: this.defaultCallback.bind(this, 'beforeAsync')
        }
      }
    }
  },
  computed: {
    treeSetting() {
      const treeSetting = merge(this.defaultSetting, this.setting)
      return treeSetting
    },
    zTree() {
      return this.$refs.ztree.zTree
    },
    rMenu() {
      return this.$refs.ztree.rMenu
    }
  },
  methods: {
    defaultCallback: function(action) {
      console.log(action)
    }
  }
}
</script>

<style scoped>

</style>
