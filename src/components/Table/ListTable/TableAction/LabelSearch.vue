<template>
  <div class="label-search">
    <el-popover
      v-model:visible="popoverVisible"
      :fallback-placements="['bottom-start']"
      :popper-options="popperOptions"
      :popper-style="popperStyle"
      :show-arrow="false"
      :width="popoverWidth"
      placement="bottom-start"
      popper-class="label-filter-popper"
      trigger="click"
      @hide="handlePopoverVisibleChange(false)"
      @show="handlePopoverShow"
    >
      <template #reference>
        <el-button
          :aria-label="$t('LabelFilterTitle')"
          :title="$t('LabelFilterTitle')"
          class="label-button"
          size="small"
          @click="preparePopoverBoundary"
        >
          <svg-icon icon-class="tag" />
        </el-button>
      </template>

      <div class="label-filter">
        <section class="label-filter__panel label-filter__keys">
          <div class="label-filter__search">
            <el-input
              ref="keySearchInput"
              v-model="keyQuery"
              :placeholder="$t('LabelFilterSearchKey')"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div v-loading="keyLoading" class="label-filter__list">
            <button
              v-for="option in filteredKeyOptions"
              :key="option.value"
              :class="{ 'is-active': option.value === activeKey }"
              class="label-filter__option label-filter__key"
              type="button"
              @click="selectKey(option.value)"
            >
              <span :title="option.label" class="label-filter__option-text">
                {{ option.label }}
              </span>
              <el-icon><ArrowRight /></el-icon>
            </button>
            <div v-if="!keyLoading && filteredKeyOptions.length === 0" class="label-filter__empty">
              {{ $t('NoData') }}
            </div>
          </div>
        </section>

        <section class="label-filter__panel label-filter__values">
          <div class="label-filter__search">
            <el-input
              v-model="valueQuery"
              :disabled="!activeKey"
              :placeholder="$t('LabelFilterSearchValue')"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div v-if="activeKey" v-loading="valueLoading" class="label-filter__list">
            <button
              v-for="option in filteredValueOptions"
              :key="option.value"
              :class="{ 'is-selected': isValueSelected(option.value) }"
              class="label-filter__option label-filter__value"
              type="button"
              @click="selectValue(option.value)"
            >
              <el-checkbox :model-value="isValueSelected(option.value)" tabindex="-1" />
              <span
                :style="{ backgroundColor: option.labelData?.color || 'transparent' }"
                aria-hidden="true"
                class="label-value-color"
              />
              <span :title="option.label" class="label-filter__option-text">
                {{ option.label }}
              </span>
            </button>
            <div
              v-if="!valueLoading && filteredValueOptions.length === 0"
              class="label-filter__empty"
            >
              {{ $t('NoData') }}
            </div>
          </div>
          <div v-else class="label-filter__empty label-filter__empty--center">
            {{ $t('LabelFilterSelectKey') }}
          </div>
        </section>
      </div>
    </el-popover>
  </div>
</template>

<script>
import _ from 'lodash'
import LabelSelector from '../../labelSelector'

export default {
  name: 'LabelSearch',
  mixins: [LabelSelector],
  emits: ['labelSearch', 'showLabelSearch'],
  props: {
    boundarySelector: {
      type: String,
      default: ''
    },
    maxWidth: {
      type: Number,
      default: 600
    }
  },
  data() {
    return {
      popoverVisible: false,
      labelValue: [],
      boundaryVersion: 0,
      popoverAvailableWidth: null
    }
  },
  computed: {
    labelSelectorVisible() {
      return this.popoverVisible
    },
    boundaryElement() {
      this.boundaryVersion
      return this.findBoundaryElement()
    },
    popoverWidth() {
      return Math.max(Math.min(this.maxWidth, this.popoverAvailableWidth ?? this.maxWidth), 1)
    },
    popperStyle() {
      return {
        '--label-filter-max-width': `${this.popoverWidth}px`
      }
    },
    popperOptions() {
      return {
        modifiers: [
          {
            name: 'flip',
            enabled: false
          },
          {
            name: 'preventOverflow',
            options: {
              mainAxis: true,
              altAxis: false,
              tether: false,
              boundary: this.boundaryElement || 'viewport',
              padding: 16
            }
          }
        ]
      }
    }
  },
  watch: {
    labelValue: {
      handler(newValue) {
        const selection = _.cloneDeep(newValue || [])
        const labelSearch = selection.map((item) => item.join(':')).join(',')
        this.$emit('labelSearch', labelSearch, selection)
      },
      deep: true
    }
  },
  mounted() {
    this.$eventBus.$on('labelSearch', this.labelSearchHandler)
  },
  beforeUnmount() {
    this.$eventBus.$off('labelSearch', this.labelSearchHandler)
  },
  methods: {
    decorateLabelValueOptions(options) {
      return [
        {
          value: '*',
          label: this.$t('LabelFilterAllValues')
        },
        ...options
      ]
    },
    findBoundaryElement() {
      if (!this.boundarySelector) {
        return null
      }
      return [...document.querySelectorAll(this.boundarySelector)].find(
        (element) => element.getBoundingClientRect().width > 0
      )
    },
    preparePopoverBoundary() {
      this.boundaryVersion += 1
      const boundaryElement = this.findBoundaryElement()
      const referenceElement = this.$el?.querySelector('.label-button')
      if (!boundaryElement || !referenceElement) {
        this.popoverAvailableWidth = null
        return
      }
      const boundaryRect = boundaryElement.getBoundingClientRect()
      const referenceRect = referenceElement.getBoundingClientRect()
      this.popoverAvailableWidth = boundaryRect.right - referenceRect.left - 16
    },
    getSelectionSnapshot() {
      return _.cloneDeep(this.labelValue)
    },
    applySelectionSnapshot(value) {
      this.labelValue = _.cloneDeep(value || [])
    },
    removeLabel(label) {
      this.labelValue = this.labelValue.filter((item) => item.join(':') !== label)
    },
    clearSelection() {
      this.labelValue = []
    },
    labelSearchHandler(label) {
      if (!label) {
        this.clearSelection()
        return
      }
      this.addSelection(label.name, label.value)
    },
    handlePopoverShow() {
      this.handlePopoverVisibleChange(true)
      this.getLabelOptions('').then(() => {
        this.$nextTick(() => this.$refs.keySearchInput?.focus())
      })
    },
    handlePopoverVisibleChange(visible) {
      this.$emit('showLabelSearch', visible)
      if (!visible) {
        this.resetLabelSelectorSearch()
      }
    },
    selectValue(value) {
      this.addSelection(this.activeKey, value)
    },
    addSelection(key, value) {
      if (!key || value === '' || value == null) {
        return
      }

      const isSelected = this.labelValue.some((item) => item[0] === key && item[1] === value)
      if (isSelected) {
        this.labelValue = this.labelValue.filter((item) => !(item[0] === key && item[1] === value))
        return
      }

      const nextValue =
        value === '*'
          ? this.labelValue.filter((item) => item[0] !== key)
          : this.labelValue.filter((item) => !(item[0] === key && item[1] === '*'))
      this.labelValue = [...nextValue, [key, value]]
    },
    isValueSelected(value) {
      return this.labelValue.some((item) => item[0] === this.activeKey && item[1] === value)
    }
  }
}
</script>

<style lang="scss" scoped>
.label-search {
  display: inline-flex;
  align-items: center;

  :deep(.el-button.label-button) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    min-width: 30px;
    height: 30px;
    margin: 0;
    padding: 0;
    color: var(--color-text-primary) !important;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background-color: #fff;

    &:hover {
      color: var(--color-text-primary) !important;
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  :deep(.label-button .svg-icon) {
    width: 12px;
    height: 12px;
    margin: 0;
    color: inherit !important;
    fill: currentColor !important;
    opacity: 0.72;
  }
}
</style>

<style lang="scss">
@use '../../labelSelector' as labelSelector;

.label-filter-popper {
  width: min(var(--label-filter-max-width, 600px), calc(100vw - 32px)) !important;
  max-width: calc(100vw - 32px);
  padding: 0 !important;
  overflow: hidden;
  border-radius: 4px !important;

  &.el-popper[data-popper-placement^='bottom'] {
    margin-top: 4px;
  }

  .el-popper__arrow {
    display: none;
  }

  .label-filter {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    height: min(360px, calc(100vh - 180px));
    min-height: 240px;

    &__panel {
      display: flex;
      min-width: 0;
      min-height: 0;
      flex-direction: column;
      background-color: #fff;
    }

    &__keys {
      border-right: 1px solid var(--el-border-color-lighter);
    }

    &__search {
      flex: 0 0 auto;
      @include labelSelector.search-input;
    }

    &__list {
      min-height: 0;
      padding: 6px;
      overflow: auto;
    }

    &__option {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      height: 36px;
      padding: 0 12px;
      color: var(--el-text-color-regular);
      font-size: 13px;
      text-align: left;
      border: 0;
      border-radius: 3px;
      background-color: transparent;
      cursor: pointer;

      &:hover,
      &:focus-visible,
      &.is-active {
        color: var(--el-text-color-primary);
        background-color: var(--el-fill-color-light);
        outline: none;
      }

      &.is-selected {
        color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }
    }

    &__option-text {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__key {
      justify-content: space-between;
      gap: 12px;

      .el-icon {
        flex: 0 0 auto;
      }
    }

    &__value {
      gap: 10px;
      @include labelSelector.value-color-swatch;

      .el-checkbox {
        flex: 0 0 auto;
        height: auto;
        margin-right: 0;
        pointer-events: none;
      }
    }

    &__empty {
      padding: 24px 12px;
      color: var(--el-text-color-placeholder);
      font-size: 13px;
      text-align: center;

      &--center {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

@media (max-width: 640px) {
  .label-filter-popper .label-filter {
    grid-template-columns: minmax(0, 42%) minmax(0, 58%);

    &__search {
      padding: 10px;
    }
  }
}
</style>
