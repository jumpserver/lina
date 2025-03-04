<template>
  <div ref="formGroup" class="form-group-header">
    <div v-if="line" class="hr-line-dashed" />
    <div v-if="group['title']">
      <h3 @click="toggle">{{ group['title'] }} </h3>
      <span class="compass" @click="toggle">
        <i :class="iconClass" />
      </span>
    </div>
    <div v-if="!isVisible" class="ellipsis" @click="toggle">
      <i class="fa fa-angle-double-down" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    line: {
      type: Boolean,
      default: true
    },
    index: {
      type: Number,
      default: 1
    },
    group: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isVisible: true
    }
  },
  computed: {
    iconClass() {
      return this.isVisible ? 'el-icon-arrow-down' : 'el-icon-arrow-up'
    }
  },
  methods: {
    toggle() {
      this.isVisible = !this.isVisible
      this.toggleSiblingVisibility()
    },
    toggleSiblingVisibility() {
      // 当前 form-group-header 的 DOM 元素
      const formGroupHeader = this.$refs.formGroup
      if (!formGroupHeader) return

      // 找到当前 form-group-header 的下一个兄弟节点
      let sibling = formGroupHeader.nextElementSibling

      // 循环隐藏或显示直到找到下一个 form-group-header
      while (sibling && sibling.classList.contains('el-form-item')) {
        sibling.style.display = this.isVisible ? '' : 'none'
        sibling = sibling.nextElementSibling
      }
    }
  }
}
</script>

<style lang="less" scoped>
.hr-line-dashed {
  border-top: 1px dashed #e7eaec;
  color: #ffffff;
  background-color: #ffffff;
  height: 1px;
  margin: 20px 0;
}

h3 {
  display: inline-block;
  cursor: pointer;
}

.compass {
  display: inline-block;
  float: right;
  cursor: pointer;
}

.ellipsis {
  text-align: center;
  cursor: pointer;
}
</style>
