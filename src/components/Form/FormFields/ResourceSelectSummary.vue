<template>
  <div class="resource-select-summary" :class="{ 'is-disabled': disabled }">
    <button
      v-if="countOnly"
      :aria-label="ariaLabel"
      :disabled="disabled"
      class="resource-select-summary__count-only"
      type="button"
      @click="handleClick"
    >
      {{ selectedCount > 0 ? countText : text }}
    </button>
    <template v-else>
      <button
        v-if="selectedCount > 0"
        :disabled="disabled"
        class="resource-select-summary__count"
        type="button"
        @click="handleClick"
      >
        {{ countText }}
      </button>
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
          <div
            v-if="items.length > 0"
            ref="names"
            class="resource-select-summary__names"
            @scroll.passive="handleScroll"
            @wheel.passive="handleWheel"
          >
            <span class="resource-select-summary__names-content">
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
          </div>
        </template>
        <span v-else class="resource-select-summary__placeholder">{{ text }}</span>
      </div>
    </template>
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
    countOnly: {
      type: Boolean,
      default: false
    },
    hasMore: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click', 'load-more', 'remove'],
  data() {
    return {
      loadMoreRequested: false
    }
  },
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
    },
    handleScroll(event) {
      const container = event.currentTarget
      if (!container) {
        return
      }
      const scrollableDistance = container.scrollHeight - container.clientHeight
      if (scrollableDistance > 0 && container.scrollTop >= scrollableDistance / 2) {
        this.requestLoadMore()
      }
    },
    handleWheel(event) {
      const container = this.$refs.names
      if (event.deltaY > 0 && container && container.scrollHeight <= container.clientHeight + 1) {
        this.requestLoadMore()
      }
    },
    requestLoadMore() {
      if (!this.hasMore || this.loadMoreRequested) {
        return
      }
      this.loadMoreRequested = true
      this.$emit('load-more')
      this.$nextTick(() => {
        this.loadMoreRequested = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.resource-select-summary {
  display: flex;
  flex-direction: column;
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

.resource-select-summary__count-only {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 30px;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--el-color-primary);
  cursor: pointer;
  font: inherit;
  line-height: 30px;
  text-align: left;

  &:hover,
  &:focus-visible {
    color: var(--el-color-primary-light-3);
  }

  &:disabled {
    color: var(--el-disabled-text-color);
    cursor: not-allowed;
  }
}

.resource-select-summary__names {
  width: 100%;
  min-height: 36px;
  max-height: 100px;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-color: transparent transparent;
  scrollbar-width: thin;

  &:hover,
  &:focus-within {
    scrollbar-color: var(--el-border-color) transparent;
  }

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 2px;
    background: transparent;
  }

  &:hover::-webkit-scrollbar-thumb,
  &:focus-within::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--el-text-color-placeholder);
  }
}

.resource-select-summary__names-content {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
  column-gap: 10px;
  row-gap: 10px;
  width: 100%;
  min-height: 36px;
  padding-top: 7px;
  padding-right: 7px;
  padding-bottom: 7px;
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
  max-width: calc(100% - 7px);
  min-height: 22px;
  padding: 1px 10px 1px 6px;
  border: 1px solid #e5e6e7;
  border-radius: 3px;
  background: #f1f1f1;
  color: var(--el-text-color-regular);
  line-height: 18px;
  white-space: normal;
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

.resource-select-summary__name-text {
  overflow-wrap: anywhere;
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
  align-self: flex-start;
  min-height: 30px;
  margin-bottom: 4px;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--el-color-primary);
  cursor: pointer;
  font: inherit;
  line-height: 30px;
  text-align: left;
  white-space: nowrap;

  &:hover,
  &:focus-visible {
    color: var(--el-color-primary-light-3);
  }

  &:disabled {
    color: var(--el-disabled-text-color);
    cursor: not-allowed;
  }
}
</style>
