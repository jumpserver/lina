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

  }
}
</script>

<style scoped>

</style>
