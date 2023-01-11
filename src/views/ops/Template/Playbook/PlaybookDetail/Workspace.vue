<template>
  <TreeTable component="FileTree">
    <template slot="table">
      <el-tabs active-name="first">
        <el-tab-pane label="main.yml" name="first">
          <CodeEditor />
        </el-tab-pane>
      </el-tabs>
    </template>
  </TreeTable>
</template>

<script>

import { TreeTable } from '@/components'
import CodeEditor from '@/components/FormFields/CodeEditor.vue'

export default {
  name: 'WorkspaceVue',
  components: {
    TreeTable,
    CodeEditor
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  },
  mounted() {
    this.$axios.get(`/api/v1/ops/playbook/${this.object.id}/file/`).then(data => {
      console.log(data)
    })
  }
}
</script>

<style scoped>

</style>
