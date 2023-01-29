<template>
  <IBox>
    <el-row :gutter="20">
      <el-col :span="20">
        <vue-markdown :source="object.readme" />
      </el-col>
      <el-col :span="4">
        <div style="">
          <el-avatar :src="object.icon" fit="fill" style="background-color: white;float: right" />
        </div>
      </el-col>
    </el-row>
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import VueMarkdown from 'vue-markdown'

export default {
  name: 'Overview',
  components: {
    VueMarkdown,
    IBox
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      markdownText: '# Hello, Markdown!'
    }
  }
}
</script>

<style scoped>

</style>
