<template>
  <div
    ref="formGroup"
    class="form-group-header"
    :class="{ 'form-group-header--subgroup': group.subgroup }"
  >
    <div v-if="line" class="hr-line-dashed" />
    <div
      v-if="group['title']"
      class="form-group-header__row"
      :class="{ 'form-group-header__row--subgroup': group.subgroup }"
    >
      <component
        :is="group.subgroup ? 'h4' : 'h3'"
        class="form-group-header__title"
        @click="$emit('toggle')"
      >
        {{ group['title'] }}
      </component>
      <button
        class="form-group-header__toggle"
        type="button"
        :aria-label="group.title"
        :aria-expanded="!collapsed"
        @click="$emit('toggle')"
      >
        <el-icon><component :is="iconClass" /></el-icon>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['toggle'],
  props: {
    collapsed: {
      type: Boolean,
      default: false
    },
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
  computed: {
    iconClass() {
      return this.collapsed ? 'ArrowRight' : 'ArrowDown'
    }
  }
}
</script>

<style lang="scss" scoped>
.form-group-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: var(--form-group-indent, 20px);
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

.form-group-header__row--subgroup {
  .form-group-header__title {
    font-size: 14px;
    font-weight: 500;
  }

  .form-group-header__toggle {
    height: 22px;
    color: var(--color-text-secondary, #7c7c7c);
  }
}

.form-group-header--subgroup {
  margin-left: 0;
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
