<template>
  <div class="filter-field">
    <el-tag
      v-for="(v, k) in filterTags"
      :key="k"
      closable
      size="small"
      type="info"
      :disable-transitions="true"
      @close="handleTagClose(v)"
      @click="handleTagClick(v,k)"
    >
      {{ v }}
    </el-tag>
    <el-input
      ref="SearchInput"
      v-model.trim="filterValue"
      :placeholder="$tc('perms.Input')"
      class="search-input"
      @blur="focus = false"
      @focus="focus = true"
      @change="handleConfirm"
      @keyup.enter.native="handleConfirm"
    />
  </div>
</template>

<script>
export default {
  props: {
    customTag: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      filterTags: this.customTag,
      focus: false,
      filterValue: ''
    }
  },
  methods: {
    handleTagClose(tag) {
      this.filterTags.splice(this.filterTags.indexOf(tag), 1)
      this.$emit('tagSearch', this.filterTags)
    },
    handleConfirm() {
      if (this.filterValue === '') return
      if (!this.filterTags.includes(this.filterValue)) {
        this.filterTags.push(this.filterValue)
        this.filterValue = ''
        this.$emit('tagSearch', this.filterTags)
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
    margin-left: 10px;
  }
  .filter-field {
    display: flex;
    align-items:  center;
    padding-left: 2px;
    border: 1px solid #dcdee2;
    border-radius: 1px;
    background-color:#fff;
    &:hover {
      border-color: #C0C4CC;
    }
  }
  .search-input >>> .el-input__inner {
    max-width: 100%;
    border: none;
    padding-left: 5px;
  }
  .el-input >>> .el-input__inner{
    border: none !important;
    font-size: 13px;
  }
  .filter-field >>> .el-input__inner {
    height: 30px;
  }
</style>
