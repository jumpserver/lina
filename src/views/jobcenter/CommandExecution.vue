<template>
  <el-collapse-transition>
    <div style="display: flex;justify-items: center; flex-wrap: nowrap;justify-content:space-between;">
      <div v-show="iShowTree" :style="iShowTree?('width:250px;'):('width:0;')" class="transition-box">
        <component
          :is="component"
          :setting="treeSetting"
          class="auto-data-ztree"
          @urlChange="handleUrlChange"
        />
      </div>
      <div :style="iShowTree?('display: flex;width: calc(100% - 250px);'):('display: flex;width:100%;')">
        <div class="mini">
          <div style="display:block" class="mini-button" @click="iShowTree=!iShowTree">
            <i v-show="iShowTree" class="fa fa-angle-left fa-x" /><i v-show="!iShowTree" class="fa fa-angle-right fa-x" />
          </div>
        </div>
        <IBox class="transition-box" style="width: calc(100% - 17px);">
          <Term />
          <div style="display: flex">
            <div>
              <CodeMirror @change="handleActionChange" />
            </div>
            <div>
              <Select2 />
            </div>
          </div>
        </IBox>
      </div>
    </div>
  </el-collapse-transition>
</template>

<script>
import AutoDataZTree from '@/components/AutoDataZTree'
import Term from '@/components/Term'
import ListTable from '@/components/ListTable'
import IBox from '@/components/IBox'
import Select2 from '@/components/Select2'
import CodeMirror from '@/components/CodeMirror'
export default {
  name: 'TreeTable',
  components: {
    ListTable,
    Term,
    AutoDataZTree,
    IBox,
    Select2,
    CodeMirror
  },
  props: {
    ...ListTable.props,
    treeSetting: {
      type: Object,
      default: () => AutoDataZTree.props.setting.default()
    },
    showTree: {
      type: Boolean,
      default: true
    },
    // 默认引用的Tree组件
    component: {
      type: String,
      default: () => 'AutoDataZTree'
    }
  },
  data() {
    return {
      iTableConfig: this.tableConfig,
      iShowTree: this.showTree,
      actions: ''
    }
  },
  methods: {
    handleUrlChange(_url) {
      this.$set(this.iTableConfig, 'url', _url)
      console.log(this.iTableConfig)
    },
    handleActionChange(val) {
      this.actions = val
    }
  }
}
</script>

<style scoped>
  .mini-button{
    width: 12px;
    float: right;
    text-align: center;
    padding: 5px 0;
    background-color: #1ab394;
    border-color: #1ab394;
    color: #FFFFFF;
    border-radius: 3px;
  }
  .el-tree{
    background-color: inherit !important;
  }
  .mini{
    margin-right: 5px;
    width: 12px !important;
  }

  .auto-data-ztree {
    overflow: auto;
    /*border-right: solid 1px red;*/
  }
</style>
