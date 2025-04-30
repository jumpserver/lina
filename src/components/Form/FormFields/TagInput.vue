<template>
  <div class="filter-field">
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
      @keyup.enter.prevent.native="handleConfirm"
    />
    <span
      v-if="replaceShowPassword && filterTags.length > 0"
      class="show-password"
      @click="handleShowPassword"
    >
      <i :class="[isCheckShowPassword ? 'fa-eye-slash' : 'fa-eye']" class="fa" />
    </span>
  </div>
</template>

<script>
import i18n from '@/i18n/i18n'

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
      this.handleConfirm()
    },
    handleSelect(item) {
      this.filterValue = item.value
      this.handleConfirm()
    },
    handleChange: _.debounce(function(item) {
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
      // this.$refs.SearchInput.focus()
    },
    handleTagClick(v, k) {
      this.$delete(this.filterTags, k)
      this.filterValue = v
      // this.$refs.SearchInput.focus()
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
  flex-wrap: wrap;
  align-items: center;
  //padding: 0 6px;
  border: 1px solid #dcdee2;
  border-radius: 1px;
  background-color: #fff;
  line-height: 30px;

  &:hover {
    border-color: #C0C4CC;
  }

  & ::v-deep .el-tag {
    margin-bottom: 1px;
    font-family: sans-serif !important;
    margin-left: 5px;
  }

  & ::v-deep .el-autocomplete {
    height: 28px;
  }
}

.search-input {
  flex: 1;

  & ::v-deep .el-input__inner {
    max-width: 100%;
    border: none;
    padding-left: 12px;
    height: 28px;
  }
}

.el-input ::v-deep .el-input__inner {
  border: none !important;
  font-size: 13px;
}

.filter-field ::v-deep .el-input__inner {
  height: 27px !important;
}

.show-password {
  display: inherit;
  padding-right: 6px;
  cursor: pointer;

  &:hover {
    color: #999999;
  }
}
</style>
