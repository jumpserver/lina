<template>
  <ZTree ref="ztree" :setting="treeSetting" v-on="$listeners">
    <!--Slot透传-->
    <div slot="rMenu" slot-scope="{data}">
      <slot name="rMenu" :data="data" />
    </div>
  </ZTree>
</template>

<script>
import ZTree from './components/ZTree'
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
            isMove: false
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
      return _.merge(this.defaultSetting, this.setting)
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
    defaultCallback: function(action) {
      // debug(action)
    }
  }
}
</script>

<style scoped>

</style>
