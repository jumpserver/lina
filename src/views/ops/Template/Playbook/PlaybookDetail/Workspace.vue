<template>
  <div>
    <TreeTable ref="TreeTable" :tree-setting="treeSetting">
      <template slot="table">
        <div class="transition-box" style="width: calc(100% - 17px);">
          <el-tabs v-model="activeEditorId" :closable="true" @tab-remove="onCloseEditor">
            <el-tab-pane
              v-for="(item,key,index) in openedEditor"
              :key="index"
              :label="tabLabel(item)"
              :name="key"
            >
              <CodeEditor
                style="margin-bottom: 20px"
                :options="cmOptions"
                :value.sync="item.value"
              />
            </el-tab-pane>
          </el-tabs>
          <div style="display: flex;margin-top:10px;justify-content: space-between" />
        </div>
      </template>
    </TreeTable>
  </div>
</template>

<script>
import { TreeTable } from '@/components'
import CodeEditor from '@/components/FormFields/CodeEditor'
import item from '@/layout/components/NavLeft/Item.vue'

export default {
  name: 'CommandExecution',
  components: {
    TreeTable,
    CodeEditor
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      DataZTree: 0,
      cmOptions: {
        mode: 'yaml'
      },
      treeSetting: {
        async: false,
        treeUrl: `/api/v1/ops/playbook/${this.object.id}/file`,
        showRefresh: true,
        showMenu: false,
        showSearch: false,
        customTreeHeader: false,
        callback: {
          onSelected: function(event, treeNode) {
            if (!treeNode.isParent) {
              this.onOpenEditor(treeNode)
            }
          }.bind(this)
        },
        check: {
          enable: false
        },
        view: {
          dblClickExpand: false,
          showLine: true
        }
      },
      iShowTree: true,
      activeEditorId: '',
      openedEditor: {}
    }
  },
  computed: {
    item() {
      return item
    },
    ztree() {
      return this.$refs.TreeTable.$refs.AutoDataZTree.$refs.dataztree.$refs.ztree
    }

  },
  mounted() {
    this.onOpenEditor({ id: 'main.yml', name: 'main.yml' })
  },
  methods: {
    onOpenEditor(node) {
      this.$set(this.openedEditor, node.id, { name: node.name, originValue: '', value: '' })
      this.activeEditorId = node.id
      this.getFileContent(node.id)
    },
    onCloseEditor(key) {
      const editor = this.openedEditor[key]
      if (this.hasChange(editor)) {
        this.$confirm('文件发生变化是否保存?', '确认保存', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          editor.originValue = editor.value
          this.$message({
            type: 'success',
            message: '保存成功!'
          })
        })
      } else {
        this.$delete(this.openedEditor, key)
        const keys = Object.keys(this.openedEditor)
        if (keys.length !== 0) {
          this.activeEditorId = keys[keys.length - 1]
        }
      }
    },
    getFileContent(key) {
      this.$axios.get(`/api/v1/ops/playbook/${this.object.id}/file/?key=${key}`).then((res) => {
        this.openedEditor[key].value = res.content
        this.openedEditor[key].originValue = res.content
      })
    },
    tabLabel(editor) {
      if (this.hasChange(editor)) {
        return editor.name + ' M'
      }
      return editor.name
    },
    hasChange(editor) {
      return editor.value !== editor.originValue
    }
  }

}
</script>

<style lang="scss" scoped>
.mini-button {
  width: 12px;
  float: right;
  text-align: center;
  padding: 5px 0;
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #FFFFFF;
  border-radius: 3px;
}

.el-tree {
  background-color: inherit !important;
}

.mini {
  margin-right: 5px;
  width: 12px !important;
}

.auto-data-ztree {
  overflow: auto;
  /*border-right: solid 1px red;*/
}

.vue-codemirror-wrap ::v-deep .CodeMirror {
  width: 600px;
  height: 100px;
  border: 1px solid #eee;
}

.tree-box {
  margin-right: 2px;
  border: 1px solid #e0e0e0;
}

.output {
  padding-left: 30px;
  background-color: rgb(247 247 247);
  border: solid 1px #f3f3f3;;
}

.status_success {
  color: var(--color-success);
}

.status_warning {
  color: var(--color-warning);
}

.status_danger {
  color: var(--color-danger);
}
</style>
