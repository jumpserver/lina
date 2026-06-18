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
        @blur="focus = false"
        @change="handleChange"
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
import _ from 'lodash'

export default {
  props: {
    value: {
      type: Array,
      default: () => []
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
      filterTags: this.value,
      isCheckShowPassword: this.replaceShowPassword
    }
  },
  computed: {
    iPlaceholder() {
      return `${this.placeholder} (${this.$t('EnterToContinue')})`
    },
    component() {
      return this.autocomplete !== null ? 'el-autocomplete' : 'el-input'
    }
  },
  watch: {
    value(val) {
      this.filterTags = val
    }
  },
  methods: {
    handleTagClose(tag) {
      this.filterTags.splice(this.filterTags.indexOf(tag), 1)
      this.$emit('change', this.filterTags)
    },
    handleSelect(item) {
      this.filterValue = item.value
      this.handleConfirm()
    },
    handleChange: _.debounce(function (item) {
      this.handleConfirm()
    }, 200),
    handleConfirm() {
      if (this.filterValue === '') return

      if (!this.filterTags.includes(this.filterValue)) {
        this.filterTags.push(this.filterValue)
        this.filterValue = ''
      }
      this.$emit('change', this.filterTags)
      this.$emit('input', this.filterTags)
      this.$refs.SearchInput.focus()
    },
    handleTagClick(v, k) {
      delete this.filterTags[k]
      this.filterValue = v
      this.$refs.SearchInput.focus()
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
      this.$emit('change', this.filterTags)
      this.$emit('input', this.filterTags)
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
