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
      <el-tooltip
        :content="countText"
        :disabled="!namesOverflowing"
        :hide-after="0"
        placement="top-start"
        popper-class="resource-select-summary__count-tooltip"
        :show-after="200"
      >
        <div
          :aria-disabled="disabled"
          :aria-label="ariaLabel"
          :class="{ 'has-selection': selectedCount > 0, 'is-disabled': disabled }"
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
              <span ref="namesContent" class="resource-select-summary__names-content">
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
                    <el-icon><Close /></el-icon>
                  </button>
                </span>
              </span>
            </div>
          </template>
          <span v-else class="resource-select-summary__placeholder">{{ text }}</span>
          <button
            v-if="selectedCount > 0 && !disabled"
            :aria-label="$t('Clear')"
            class="resource-select-summary__clear"
            type="button"
            @click.stop="$emit('clear')"
          >
            <el-icon><CircleClose /></el-icon>
          </button>
        </div>
      </el-tooltip>
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
  emits: ['clear', 'click', 'load-more', 'remove'],
  data() {
    return {
      loadMoreRequested: false,
      namesOverflowing: false,
      namesResizeObserver: null,
      observedNames: null,
      observedNamesContent: null
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
  watch: {
    items: {
      deep: true,
      handler() {
        this.scheduleNamesOverflowCheck()
      }
    },
    selectedCount() {
      this.scheduleNamesOverflowCheck()
    }
  },
  mounted() {
    this.scheduleNamesOverflowCheck()
  },
  beforeUnmount() {
    this.disconnectNamesResizeObserver()
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
    scheduleNamesOverflowCheck() {
      this.$nextTick(() => {
        this.syncNamesResizeObserver()
        this.updateNamesOverflow()
      })
    },
    syncNamesResizeObserver() {
      const names = this.$refs.names || null
      const namesContent = this.$refs.namesContent || null
      if (names === this.observedNames && namesContent === this.observedNamesContent) {
        return
      }

      this.disconnectNamesResizeObserver()
      this.observedNames = names
      this.observedNamesContent = namesContent
      if (!names || typeof ResizeObserver === 'undefined') {
        return
      }

      this.namesResizeObserver = new ResizeObserver(() => this.updateNamesOverflow())
      this.namesResizeObserver.observe(names)
      if (namesContent) {
        this.namesResizeObserver.observe(namesContent)
      }
    },
    disconnectNamesResizeObserver() {
      this.namesResizeObserver?.disconnect()
      this.namesResizeObserver = null
      this.observedNames = null
      this.observedNamesContent = null
    },
    updateNamesOverflow() {
      const names = this.$refs.names
      const overflowing = Boolean(names && names.scrollHeight > names.clientHeight + 1)
      if (this.namesOverflowing !== overflowing) {
        this.namesOverflowing = overflowing
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
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 30px;
  height: auto;
  overflow: hidden;
  padding: 0;
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
  flex: 1 1 100%;
  width: 100%;
  min-width: 0;
  min-height: 28px;
  max-height: 80px;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-color: var(--el-border-color) transparent;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 2px;
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
  align-items: center;
  align-content: center;
  column-gap: 0;
  row-gap: 0;
  width: 100%;
  min-height: 28px;
  padding-right: 30px;
}

.resource-select-summary__placeholder {
  padding: 0 11px;
  color: var(--el-text-color-secondary);
}

.resource-select-summary__name {
  box-sizing: border-box;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  max-width: 100%;
  height: 22px;
  margin: 2px 0 2px 6px;
  padding: 0 8px;
  border: 1px solid #e5e6e7;
  border-radius: 4px;
  background: #f1f1f1;
  color: var(--el-text-color-regular);
  line-height: 18px;
  white-space: normal;
  transition:
    background-color var(--el-transition-duration-fast),
    border-color var(--el-transition-duration-fast),
    color var(--el-transition-duration-fast);

  &:hover,
  &:focus-within {
    border-color: var(--el-border-color);
    background: var(--el-fill-color);
    color: var(--el-text-color-primary);
  }
}

.resource-select-summary__name-text {
  min-width: 0;
  overflow-wrap: anywhere;
}

.resource-select-summary__remove {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  margin-left: 4px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 10px;
  overflow: hidden;
  transition:
    background-color var(--el-transition-duration-fast),
    color var(--el-transition-duration-fast);

  &:hover,
  &:focus-visible {
    background: var(--el-text-color-secondary);
    color: var(--el-color-white);
  }
}

.resource-select-summary__clear {
  position: absolute;
  top: 50%;
  right: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  padding: 0;
  border: 0;
  outline: none;
  opacity: 0;
  background: transparent;
  color: #c0c4cc;
  cursor: pointer;
  font-size: 14px;
  pointer-events: none;
  transform: translateY(-50%);
  transition:
    opacity var(--el-transition-duration-fast),
    color var(--el-transition-duration-fast);

  &:hover,
  &:focus-visible {
    color: #606164;
  }
}

.resource-select-summary__control:hover .resource-select-summary__clear,
.resource-select-summary__control:focus-within .resource-select-summary__clear {
  opacity: 1;
  pointer-events: auto;
}
</style>

<style lang="scss">
.resource-select-summary__count-tooltip[data-popper-placement^='top'] {
  .el-popper__arrow {
    left: 16px !important;
    transform: none !important;
  }
}
</style>
