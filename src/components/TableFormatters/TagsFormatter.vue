<template>
  <div>
    <el-tag
      v-for="tag of cellValue"
      :key="tag"
      :type="getTagType(tag)"
      class="tag-formatter"
      disable-transitions
    >
      <i class="fa fa-tag" /> {{ tag }}
    </el-tag>
  </div>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'TagsFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          getTagType(tag) {
            return 'primary'
          }
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  methods: {
    getTagType(tag) {
      return this.formatterArgs.getTagType(tag)
    }
  }
}
</script>

<style scoped>

.tag-formatter {
  margin: 2px 0;
}
</style>
