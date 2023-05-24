<template>
  <div>
    <el-tag
      v-for="tag of iTags"
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
          },
          getTags(cellValue) {
            return cellValue
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
  computed: {
    iTags() {
      return this.formatterArgs.getTags(this.cellValue)
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
