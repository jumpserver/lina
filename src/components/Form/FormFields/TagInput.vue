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
      :type="inputType"
      :fetch-suggestions="autocomplete"
      :placeholder="this.$t('common.EnterToContinue')"
      class="search-input"
      @blur="focus = false"
      @focus="focus = true"
      @select="handleSelect"
      @keyup.enter.native="handleConfirm"
    />
    <span
      v-if="replaceShowPassword && filterTags.length > 0"
      class="show-password"
      @click="handleShowPassword"
    >
      <i class="fa" :class="[isCheckShowPassword ? 'fa-eye-slash' : 'fa-eye']" />
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
      default: () => i18n.t('perms.Input')
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
      filterTags: this.value,
      focus: false,
      filterValue: '',
      isCheckShowPassword: this.replaceShowPassword,
      component: this.autocomplete ? 'el-autocomplete' : 'el-input'
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
    handleConfirm() {
      if (this.filterValue === '') return

      if (!this.filterTags.includes(this.filterValue)) {
        this.filterTags.push(this.filterValue)
        this.filterValue = ''
        this.$emit('change', this.filterTags)
      }
    },
    handleTagClick(v, k) {
      if (this.filterValue.length !== 0) {
        this.handleConfirm()
      }
      this.$delete(this.filterTags, k)
      this.filterValue = v
      this.$refs.SearchInput.focus()
    },
    matchRule(value) {
      const regex = new RegExp(this.replaceRule)
      const replacedValue = value.replace(regex, (match, p1, p2, p3) => {
        const stars = p2.replace(/./g, this.replaceContent)
        return p1 + stars + p3
      })
      return replacedValue
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
    padding-left: 2px;
    padding-bottom: 3px;
    border: 1px solid #dcdee2;
    border-radius: 1px;
    background-color: #fff;
    line-height: 32px;

    &:hover {
      border-color: #C0C4CC;
    }

    &>>> .el-tag {
      margin-top: 3px;
      font-family: sans-serif !important;
    }

    &>>> .el-autocomplete {
      height: 26px;
    }
  }

  .search-input {
    flex: 1;
    &>>> .el-input__inner {
      max-width: 100%;
      border: none;
      padding-left: 5px;
    }
  }

  .el-input >>> .el-input__inner {
    border: none !important;
    font-size: 13px;
  }

  .filter-field >>> .el-input__inner {
    height: 26px;
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
