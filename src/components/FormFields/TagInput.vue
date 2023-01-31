<template>
  <div class="filter-field">
    <el-tag
      v-for="(v, k) in filterTags"
      :key="k"
      :disable-transitions="true"
      :type="tagType"
      closable
      size="small"
      @click="handleTagClick(v,k)"
      @close="handleTagClose(v)"
    >
      {{ v }}
    </el-tag>
    <el-input
      ref="SearchInput"
      v-model.trim="filterValue"
      :placeholder="this.$t('common.EnterToContinue')"
      class="search-input"
      @blur="focus = false"
      @change="handleConfirm"
      @focus="focus = true"
      @keyup.enter.native="handleConfirm"
    />
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
      type: String,
      default: 'info'
    },
    placeholder: {
      type: String,
      default: () => i18n.t('perms.Input')
    }
  },
  data() {
    return {
      filterTags: this.value,
      focus: false,
      filterValue: ''
    }
  },
  methods: {
    handleTagClose(tag) {
      this.filterTags.splice(this.filterTags.indexOf(tag), 1)
      this.$emit('change', this.filterTags)
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
    padding-left: 2px;
    border: 1px solid #dcdee2;
    border-radius: 1px;
    background-color: #fff;

    &:hover {
      border-color: #C0C4CC;
    }
  }

  .search-input > > > .el-input__inner {
    max-width: 100%;
    border: none;
    padding-left: 5px;
  }

  .el-input > > > .el-input__inner {
    border: none !important;
    font-size: 13px;
  }

  .filter-field > > > .el-input__inner {
    //height: 32px;
  }
</style>
