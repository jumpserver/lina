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
          onRightClick: this.defaultCallback('onRightClick'),
          onRename: this.defaultCallback('Rename'),
          beforeClick: this.defaultCallback('beforeClick'),
          onSelected: this.defaultCallback('onSelected'),
          beforeDrag: this.defaultCallback('beforeDrag'),
          onDrag: this.defaultCallback('onDrag'),
          beforeDrop: this.defaultCallback('beforeDrop'),
          onDrop: this.defaultCallback('onDrop'),
          beforeAsync: this.defaultCallback('beforeAsync')
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
