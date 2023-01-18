<template>
  <div>
    <TreeTable ref="TreeTable" :tree-setting="treeSetting">
      <template slot="rMenu">
        <li id="m_create_file" class="rmenu" tabindex="-1" @click="onCreate('file')">
          创建文件
        </li>
        <li id="m_create_directory" class="rmenu" tabindex="-1" @click="onCreate('directory')">
          创建文件夹
        </li>
        <li id="m_rename" class="rmenu" tabindex="-1" @click="onRename">
          重命名
        </li>
        <li id="m_delete" class="rmenu" tabindex="-1" @click="onDelete">
          删除
        </li>
      </template>
      <template slot="table">
        <div class="transition-box" style="width: calc(100% - 17px);">
          <el-tabs v-model="activeEditorId" :closable="true" @tab-remove="onCloseEditor">
            <el-tab-pane
              v-for="(item,key) in openedEditor"
              :key="key"
              :label="tabLabel(item)"
              :name="key"
            >
              <CodeEditor
                style="margin-bottom: 20px"
                :options="cmOptions"
                :toolbar="toolbar"
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
import item from '@/layout/components/NavLeft/Item'

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
      parentId: '',
      closing: false,
      DataZTree: 0,
      cmOptions: {
        mode: 'yaml'
      },
      toolbar: {
        left: {
          save: {
            type: 'button',
            align: 'left',
            icon: 'fa fa-save',
            el: {
              type: 'primary'
            },
            callback: () => {
              this.onSave()
            }
          },
          reset: {
            type: 'button',
            align: 'left',
            icon: 'fa fa-refresh',
            el: {
              type: 'primary'
            },
            callback: () => {
              this.onReset()
            }
          }
        }
      },
      treeSetting: {
        async: false,
        treeUrl: `/api/v1/ops/playbook/${this.object.id}/file`,
        showRefresh: true,
        showMenu: true,
        showDelete: false,
        showCreate: false,
        showUpdate: false,
        showSearch: false,
        customTreeHeader: false,
        callback: {
          onSelected: function(event, treeNode) {
            if (!treeNode.isParent) {
              this.onOpenEditor(treeNode)
            }
          }.bind(this),
          refresh: function(event, treeNode) {
            // const parentNode = this.zTree.getNodeByParam('id', this.parentId)
            // this.zTree.expandNode(parentNode, true, false, false, false)
          },
          onRename: function(event, treeId, treeNode, isCancel) {
            const url = `/api/v1/ops/playbook/${this.object.id}/file/`
            if (isCancel) {
              return
            }
            this.$axios.patch(url, { key: treeNode.id, new_name: treeNode.name, is_directory: treeNode.isParent })
              .then(data => {
                this.refreshTree()
              })
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
    zTree() {
      return this.$refs.TreeTable.$refs.AutoDataZTree.$refs.dataztree.zTree
    },
    dataztree() {
      return this.$refs.TreeTable.$refs.AutoDataZTree
    },
    activeEditor() {
      return this.openedEditor[this.activeEditorId]
    },
    refreshTree() {
      return this.$refs.TreeTable.$refs.AutoDataZTree.$refs.dataztree.refresh
    }
  },
  mounted() {
    this.onOpenEditor({ id: 'main.yml', name: 'main.yml' })
  },
  methods: {
    onReset() {
      const editor = this.activeEditor
      editor.value = editor.originValue
    },
    onSave() {
      const editor = this.activeEditor
      this.$axios.patch(`/api/v1/ops/playbook/${this.object.id}/file/`,
        { key: this.activeEditorId, content: editor.value }).then(data => {
        editor.originValue = editor.value
        if (this.closing) {
          this.remoteTab(editor.key)
        }
        this.$message.success('保存成功!')
      })
    },
    onCreate(type) {
      this.dataztree.hideRMenu()
      const parentNode = this.zTree.getSelectedNodes()[0]
      if (!parentNode) {
        return
      }
      const parentId = parentNode.isParent ? parentNode.id : parentNode.pId

      this.zTree.expandNode(parentNode, true, false, true, false)
      const req = {
        key: parentId,
        is_directory: type === 'directory'
      }
      this.$axios.post(`/api/v1/ops/playbook/${this.object.id}/file/`, req).then(data => {
        const newNode = data
        this.zTree.addNodes(parentNode, newNode)
        const node = this.zTree.getNodeByParam('id', newNode.id, parentNode)
        this.zTree.editName(node)
      })
    },
    onDelete() {
      this.dataztree.hideRMenu()
      const node = this.zTree.getSelectedNodes()[0]
      if (!node) {
        return
      }
      this.$confirm('删除操作无法恢复是否继续?', '确认保存', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios.delete(`/api/v1/ops/playbook/${this.object.id}/file/?key=${node.id}`).then(() => {
          if (!node.isParent) {
            this.remoteTab(node.id)
          }
          this.zTree.removeNode(node)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
    },
    onRename() {
      this.dataztree.hideRMenu()
      const node = this.zTree.getSelectedNodes()[0]
      if (!node) {
        return
      }
      this.zTree.editName(node)
    },
    onOpenEditor(node) {
      this.$set(this.openedEditor, node.id,
        { key: node.id, name: node.name, originValue: '', value: '' })
      this.activeEditorId = node.id
    },
    onCloseEditor(key) {
      const editor = this.openedEditor[key]
      let text = ''
      if (this.hasChange(editor)) {
        text = '文件发生变化是否保存?'
      } else {
        this.remoteTab(key)
        return
      }
      this.$confirm(text, '确认关闭', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.closing = true
        this.onSave()
      }).catch(() => {
        this.remoteTab(key)
      })
    },
    remoteTab(key) {
      this.$delete(this.openedEditor, key)
      const keys = Object.keys(this.openedEditor)
      if (keys.length !== 0) {
        this.activeEditorId = keys[keys.length - 1]
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
        return (editor.key + ' M').replace('root/', '')
      }
      return editor.key.replace('root/', '')
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

.auto-data-zTree {
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

.rmenu {
  font-size: 12px;
  padding: 0 16px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #606266;
  height: 24px;
  line-height: 24px;
  box-sizing: border-box;
  cursor: pointer;
}
</style>
