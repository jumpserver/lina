<template>
  <div class="resource-select-summary" :class="{ 'is-disabled': disabled }">
    <div
      :aria-disabled="disabled"
      :aria-label="ariaLabel"
      :class="{ 'is-disabled': disabled }"
      :tabindex="disabled ? -1 : 0"
      class="resource-select-summary__control"
      role="button"
      @click="handleClick"
      @keydown.enter.prevent="handleClick"
      @keydown.space.prevent="handleClick"
    >
      <template v-if="selectedCount > 0">
        <span class="resource-select-summary__content">
          <span class="resource-select-summary__count">{{ countText }}</span>
          <span v-if="items.length > 0" class="resource-select-summary__names">
            <span
              v-for="item in items"
              :key="String(item.value)"
              class="resource-select-summary__name"
            >
              <span class="resource-select-summary__name-text">{{ item.name }}</span>
              <button
                v-if="!disabled"
                :aria-label="`${$t('Remove')} ${item.name}`"
                class="resource-select-summary__remove"
                type="button"
                @click.stop="$emit('remove', item.value)"
              >
                <el-icon><CircleCloseFilled /></el-icon>
              </button>
            </span>
          </span>
        </span>
      </template>
      <span v-else class="resource-select-summary__placeholder">{{ text }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResourceSelectSummary',
  props: {
    text: {
      type: String,
      default: ''
    },
    items: {
      type: Array,
      default: () => []
    },
    selectedCount: {
      type: Number,
      default: 0
    },
    countText: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click', 'remove'],
  computed: {
    ariaLabel() {
      if (this.selectedCount === 0) {
        return this.text
      }
      return [...this.items.map((item) => item.name), this.countText].filter(Boolean).join(', ')
    }
  },
  methods: {
    handleClick() {
      if (!this.disabled) {
        this.$emit('click')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.resource-select-summary {
  width: 100%;
  min-height: 30px;
  color: var(--el-input-text-color, var(--el-text-color-regular));
  font-size: 13px;

  &.is-disabled {
    color: var(--el-disabled-text-color);
  }
}

.resource-select-summary__control {
  box-sizing: border-box;
  display: block;
  width: 100%;
  min-height: 30px;
  height: auto;
  overflow: hidden;
  padding: 4px 11px;
  border: 1px solid var(--el-border-color);
  border-radius: 0;
  outline: none;
  background: var(--el-fill-color-blank);
  color: inherit;
  cursor: pointer;
  font: inherit;
  line-height: 20px;
  text-align: left;
  white-space: normal;
  transition: border-color var(--el-transition-duration-fast);

  &:hover:not(.is-disabled) {
    border-color: var(--el-border-color-hover);
  }

  &:focus,
  &:focus-visible {
    outline: none;
  }

  &.is-disabled {
    border-color: var(--el-disabled-border-color);
    background: var(--el-disabled-bg-color);
    cursor: not-allowed;
  }
}

.resource-select-summary__content {
  display: block;
  overflow: hidden;
}

.resource-select-summary__names {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  margin-top: 4px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-top: 7px;
  padding-right: 7px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.resource-select-summary__count,
.resource-select-summary__placeholder {
  color: var(--el-text-color-secondary);
}

.resource-select-summary__name {
  box-sizing: border-box;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  position: relative;
  min-height: 22px;
  padding: 1px 10px 1px 6px;
  border: 1px solid #e5e6e7;
  border-radius: 3px;
  background: #f1f1f1;
  color: var(--el-text-color-regular);
  line-height: 18px;
  white-space: nowrap;
  transition:
    background-color var(--el-transition-duration-fast),
    border-color var(--el-transition-duration-fast),
    color var(--el-transition-duration-fast);

  &:hover .resource-select-summary__remove,
  &:focus-within .resource-select-summary__remove {
    opacity: 0.72;
    pointer-events: auto;
  }

  &:hover,
  &:focus-within {
    border-color: var(--el-border-color);
    background: var(--el-fill-color);
    color: var(--el-text-color-primary);
  }

  &:hover .resource-select-summary__remove:hover,
  &:focus-within .resource-select-summary__remove:focus-visible {
    opacity: 1;
  }
}

.resource-select-summary__remove {
  position: absolute;
  top: 0;
  right: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  font-size: 14px;
  opacity: 0;
  pointer-events: none;
  transform: translate(50%, -50%);
  transition:
    color var(--el-transition-duration-fast),
    opacity var(--el-transition-duration-fast);

  &:hover,
  &:focus-visible {
    color: var(--el-text-color-primary);
  }
}

.resource-select-summary__count {
  display: block;
  white-space: nowrap;
}
</style>
