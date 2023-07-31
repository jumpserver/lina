<template>
  <el-tag
    :size="tag.size"
    :type="tag.type"
    class="tag-formatter"
    disable-transitions
  >
    <i v-if="tag.icon" :class="tag.icon" class="fa" /> {{ tag.label }}
  </el-tag>
</template>

<script>
import BaseFormatter from './base.vue'

export default {
  name: 'TagChoicesFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          getTag({ row, cellValue }) {
            return null
          },
          getTagSize({ row, cellValue }) {
            return 'mini'
          },
          getTagLabel({ row, cellValue }) {
            return cellValue
          },
          getTagType({ row, cellValue }) {
            return 'primary'
          },
          getTagIcon({ row, cellValue }) {
            return ''
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
    tag() {
      return this.iGetTag()
    }
  },
  methods: {
    iGetTag() {
      let tag = this.formatterArgs.getTag({ row: this.row, cellValue: this.cellValue })
      if (tag) return tag
      tag = {
        size: this.formatterArgs.getTagSize({ row: this.row, cellValue: this.cellValue }),
        type: this.formatterArgs.getTagType({ row: this.row, cellValue: this.cellValue }),
        label: this.formatterArgs.getTagLabel({ row: this.row, cellValue: this.cellValue }),
        icon: this.formatterArgs.getTagIcon({ row: this.row, cellValue: this.cellValue })
      }
      return tag
    }
  }
}
</script>

<style scoped>

.tag-formatter {
  margin: 2px 0;
}
</style>
