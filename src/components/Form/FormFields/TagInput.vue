<template>
  <div class="filter-field">
    <div class="filter-field__content">
      <el-tag
        v-for="(v, k) in filterTags"
        :key="k"
        :disable-transitions="true"
        :type="tagType(v)"
        closable
        size="small"
        @click="handleTagClick(v, k)"
        @close="handleTagClose(v)"
      >
        {{ isCheckShowPassword ? changeTagShowValue(v) : v }}
      </el-tag>
      <component
        :is="component"
        ref="SearchInput"
        v-model.trim="filterValue"
        :fetch-suggestions="autocomplete"
        :placeholder="iPlaceholder"
        :type="inputType"
        class="search-input"
        @blur="handleBlur"
        @focus="focus = true"
        @select="handleSelect"
        @keyup.enter.prevent="handleConfirm"
      />
    </div>
    <span
      v-if="replaceShowPassword && filterTags.length > 0"
      class="show-password"
      @click="handleShowPassword"
    >
      <i :class="[isCheckShowPassword ? 'fa-eye-slash' : 'fa-eye']" class="fa" />
    </span>
    <span v-if="filterTags.length > 0" class="clear-icon" @click="handleClearAll">
      <el-icon :title="$t('Clear')"><CircleClose /></el-icon>
    </span>
  </div>
</template>

<script>
import i18n from '@/i18n/i18n'

export default {
  emits: ['input', 'change', 'update:modelValue', 'update:model-value'],
  props: {
    value: {
      type: [Array, String],
      default: () => []
    },
    modelValue: {
      type: [Array, String],
      default: undefined
    },
    tagType: {
      type: Function,
      default: () => {
        return 'info'
      }
    },
    placeholder: {
      type: String,
      default: () => i18n.t('Input')
    },
    autocomplete: {
      type: Function,
      default: null
    },
    replaceShowPassword: {
      type: Boolean,
      default: false
    },
    replaceRule: {
      type: String,
      default: ''
    },
    replaceContent: {
      type: String,
      default: '*'
    },
    inputType: {
      type: String,
      default: () => 'text'
    }
  },
  data() {
    return {
      focus: false,
      filterValue: '',
      filterTags: this.normalizeTags(this.currentValue),
      isCheckShowPassword: this.replaceShowPassword
    }
  },
  computed: {
    currentValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    iPlaceholder() {
      return `${this.placeholder} (${this.$t('EnterToContinue')})`
    },
    component() {
      return this.autocomplete !== null ? 'el-autocomplete' : 'el-input'
    }
  },
  watch: {
    value(val) {
      if (this.modelValue === undefined) {
        this.filterTags = this.normalizeTags(val)
      }
    },
    modelValue(val) {
      this.filterTags = this.normalizeTags(val)
    }
  },
  methods: {
    normalizeTags(value) {
      if (Array.isArray(value)) return value.slice()
      if (value === undefined || value === null || value === '') return []
      return [value]
    },
    emitTags(tags = this.filterTags) {
      const payload = this.normalizeTags(tags)
      this.$emit('change', payload)
      this.$emit('input', payload)
      this.$emit('update:modelValue', payload)
      this.$emit('update:model-value', payload)
    },
    handleTagClose(tag) {
      this.filterTags = this.filterTags.filter((item) => item !== tag)
      this.emitTags()
    },
    handleSelect(item) {
      this.filterValue = item.value
      this.handleConfirm()
    },
    // 失焦时把未提交的输入收成一个 tag；不再用 @change 防抖自动提交，
    // 否则 el-input 的 change 在每次输入后触发会把 "123" 拆成 1/2/3 三个 tag。
    // blur 路径不回焦，避免点击别处仍把焦点抢回输入框。
    handleBlur() {
      this.focus = false
      this.handleConfirm(false)
    },
    handleConfirm(refocus = true) {
      const value = this.filterValue.trim()
      if (value === '') return

      if (!this.filterTags.includes(value)) {
        this.filterTags = [...this.filterTags, value]
      }
      this.filterValue = ''
      this.emitTags()
      // 回车/选中后保持焦点便于连续录入；失焦提交时不抢回焦点
      if (refocus) {
        this.$refs.SearchInput?.focus()
      }
    },
    handleTagClick(v, k) {
      this.filterTags.splice(k, 1)
      this.filterValue = v
      this.$refs.SearchInput?.focus()
    },
    matchRule(value) {
      const regex = new RegExp(this.replaceRule)
      return value.replace(regex, (match, p1, p2, p3) => {
        const stars = p2.replace(/./g, this.replaceContent)
        return p1 + stars + p3
      })
    },
    changeTagShowValue(value) {
      if (this.replaceShowPassword && this.replaceRule) {
        value = this.matchRule(value)
      }
      return value
    },
    handleShowPassword() {
      this.isCheckShowPassword = !this.isCheckShowPassword
    },
    handleClearAll() {
      this.filterTags = []
      this.emitTags()
    }
  }
}
</script>

<style lang="scss" scoped>
.el-tag + .el-tag {
  margin-left: 4px;
}

.filter-field {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 30px;
  padding: 0 8px 0 4px;
  box-sizing: border-box;
  border: 1px solid #dcdee2;
  border-radius: 1px;
  background-color: #fff;
  line-height: 1.4;
  overflow: hidden;

  &:hover {
    border-color: #c0c4cc;
  }

  .filter-field__content {
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    align-items: center;
    min-width: 0;
  }

  & :deep(.el-tag) {
    height: 24px;
    line-height: 22px;
    margin-top: 2px;
    margin-bottom: 2px;
    font-family: sans-serif !important;
    margin-left: 5px;
    padding: 0 8px;
  }

  & :deep(.el-input),
  & :deep(.el-autocomplete) {
    flex: 1 1 auto;
    min-width: 120px;
    border: none !important;
    box-shadow: none !important;
    background: transparent;
  }

  & :deep(.el-input__wrapper) {
    min-height: 28px;
    height: 28px;
    padding: 0;
    border: none !important;
    background: transparent;
    box-shadow: none !important;
  }

  & :deep(.el-autocomplete) {
    height: 28px;
  }
}

.search-input {
  flex: 1;
  min-width: 150px;
  width: auto;
  max-width: 100%;
  border: none !important;
  box-shadow: none !important;

  & :deep(input.el-input__inner) {
    max-width: 100%;
    border: none !important;
    outline: none !important;
    appearance: none !important;
    -webkit-appearance: none !important;
    box-shadow: none !important;
    background: transparent !important;
    padding-left: 8px;
    height: 28px;
    line-height: 28px;
  }

  & :deep(.el-input) {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }

  & :deep(.el-input__wrapper) {
    width: 100%;
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }
}

.filter-field :deep(input.el-input__inner) {
  border: none !important;
  outline: none !important;
  appearance: none !important;
  -webkit-appearance: none !important;
  font-size: 13px;
  background: transparent !important;
}

.filter-field :deep(.el-input__suffix),
.filter-field :deep(.el-input__suffix-inner) {
  display: inline-flex;
  align-items: center;
  height: 28px;
}

.show-password {
  display: inherit;
  padding-right: 6px;
  cursor: pointer;

  &:hover {
    color: #999999;
  }
}

.clear-icon {
  display: inherit;
  padding-right: 6px;
  cursor: pointer;
  color: #c0c4cc;

  &:hover {
    color: #606164;
  }
}
</style>
