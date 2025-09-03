<template>
  <el-row :gutter="20">
    <el-col
      :span="14"
    >
      <div style="border: 1px solid #ccc; padding: 10px;">
        <toolbar
          style="border-bottom: 1px solid #ccc"
          :editor="editor"
          :default-config="toolbarConfig"
          :mode="mode"
        />
        <editor
          v-model="html"
          style="height: 500px; overflow-y: hidden;"
          :default-config="editorConfig"
          :mode="mode"
          @onCreated="onCreated"
          @onChange="onChange"
        />
      </div>
    </el-col>
    <el-col :span="8">
      <div style="border: 1px solid #ccc; padding: 10px;">
        <h3>Content HTML:</h3>
        <el-input v-model="html" />
      </div>
    </el-col>
  </el-row>

</template>
<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'

export default ({
  nane: 'RichEditor',
  components: { Editor, Toolbar },
  data() {
    return {
      editor: null,
      html: '<p>hello</p>',
      toolbarConfig: {},
      editorConfig: { placeholder: '请输入内容...' },
      mode: 'simple' // or 'simple'
    }
  },
  mounted() {
  },
  beforeDestroy() {
    const editor = this.editor
    if (editor == null) return
    editor.destroy() // 组件销毁时，及时销毁编辑器
  },
  methods: {
    onCreated(editor) {
      this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
    },
    onChange(editor) {
      this.html = editor.getHtml()
      console.log(editor.getHtml())
    }
  }
})
</script>
