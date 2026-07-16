<template>
  <div ref="formGroup" class="form-group-header">
    <div v-if="line" class="hr-line-dashed" />
    <div v-if="group['title']" class="form-group-header__row">
      <h3 class="form-group-header__title" @click="toggle">{{ group['title'] }}</h3>
      <button class="form-group-header__toggle" type="button" @click="toggle">
        <el-icon><component :is="iconClass" /></el-icon>
      </button>
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
      return this.isVisible ? 'ArrowDown' : 'ArrowUp'
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

<style lang="scss" scoped>
.form-group-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 20px;
}

.hr-line-dashed {
  border-top: 1px dashed #e7eaec;
  color: #ffffff;
  background-color: #ffffff;
  height: 1px;
  margin: 6px 0 0;
}

.form-group-header__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.form-group-header__title {
  margin: 0;
  font-size: 1.17em;
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
  color: var(--color-text-primary);
}

.form-group-header__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-icon-primary);
  cursor: pointer;
}
</style>
