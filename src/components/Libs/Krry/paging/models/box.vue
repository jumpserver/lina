<template>
  <div class="el-transfer-panel district-panel">
    <div class="el-transfer-panel__header">
      <el-checkbox
        v-model="checkAll"
        :indeterminate="isIndeterminate"
        @change="handleCheckAllChange"
      >
        {{ title }}
      </el-checkbox>
      <span class="check-number">
        {{ checkedData.length }}/{{ districtListMock.length }}
      </span>
    </div>
    <div class="el-transfer-panel__body">
      <div
        v-if="filterable"
        class="el-transfer-panel__filter el-input el-input--mini el-input--prefix"
      >
        <input
          v-model.trim="searchWord"
          :class="{ showClear: showClearBtn }"
          :placeholder="filterPlaceholder"
          autocomplete="off"
          class="el-input__inner"
          type="text"
          @change="handleKeyword"
        >
        <span class="el-input__prefix" style="left: 0px">
          <i class="el-input__icon el-icon-search" />
        </span>
        <span v-if="searchWord && showClearBtn" class="clear-input">
          <i class="el-icon-circle-close" @click="clearInp" />
        </span>
      </div>
      <el-checkbox-group
        v-if="districtListMock.length > 0"
        v-model="checkedData"
        :class="{ expand: !filterable }"
        @change="handleCheckedChange"
      >
        <el-checkbox
          v-for="(item, index) in districtListMock"
          :key="index"
          :disabled="item.disabled"
          :label="item"
          :title="item.label"
          class="el-transfer-panel__item"
        >
          <span v-html="isHighlight ? filterHighlight(item.label) : item.label" />
        </el-checkbox>
      </el-checkbox-group>
      <p v-else class="no-data">{{ this.$t('common.NoData') }}</p>
    </div>
    <div class="vip-footer">
      <el-button :disabled="disabledPre" class="v-page" plain small @click="prev">
        {{ pageTexts[0] || defaultPrev }}
      </el-button>
      <el-button :disabled="disabledNex" class="v-page" plain small @click="next">
        {{ pageTexts[1] || defaultNext }}
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    title: {
      type: String,
      default: () => ''
    },
    operateId: {
      type: Number,
      default: () => 0
    },
    dataShowList: {
      type: Array,
      default: () => []
    },
    pageSize: {
      type: Number,
      default: () => 10
    },
    filterable: {
      type: Boolean
    },
    filterPlaceholder: {
      type: String,
      default: () => 'Search'
    },
    pageTexts: {
      type: Array,
      default: () => ['', '']
    },
    async: {
      type: Boolean,
      default: () => false // 已选区不做异步
    },
    isLastPage: {
      type: Boolean
    },
    isHighlight: {
      type: Boolean
    },
    highlightColor: {
      type: String,
      default: () => '#409EFF'
    },
    asyncSearchFlag: {
      // 是否设置了异步搜索方法
      type: Boolean
    },
    showClearBtn: {
      type: Boolean
    }
  },
  data() {
    return {
      districtListMock: [], // 展示的数据 （搜索和分页会自动修改这个数组）
      checkedData: [], // 已选择，数据格式：[id,id,id...]
      isIndeterminate: false,
      checkAll: false,
      searchWord: '',
      len: 0,
      total: 0,
      pageIndex: 0,
      disabledPre: true,
      disabledNex: false,
      asyncSearch: false, // 要执行异步搜索的标记
      asyncPageIndex: 1, // 异步分页的 pageIndex
      asyncSearchPageIndex: 1, // 异步搜索的 pageIndex,
      defaultPrev: '< ' + this.$tc('common.PagePrev'),
      defaultNext: this.$tc('common.PageNext') + ' >'
    }
  },
  watch: {
    // 搜索框的监听器
    searchWord(newWord) {
      this.$emit('search-word', newWord, this.operateId)
    },
    // districtListMock 和 checkAll 的监听器
    districtListMock() {
      // 当方框中无已选择的数据时，不能勾选checkBox
      if (this.checkedData.length === 0) {
        this.checkAll = false
        this.isIndeterminate = false
      }
    },
    checkedData(newWord) {
      this.$emit('check-disable', newWord, this.operateId)
    },
    // 当列表中无数据时，不能勾选checkBox
    checkAll() {
      this.checkAll = this.districtListMock.length === 0 ? false : this.checkAll
    },
    dataShowList: {
      handler() {
        this.async ? this.asyncInitData() : this.initData()
      },
      deep: true
    }
  },
  created() {
    this.initData()
  },
  methods: {
    handleKeyword() {
      this.asyncSearchPageIndex = 1
      this.asyncSearchFlag &&
        this.$emit(
          'get-data-by-keyword',
          this.searchWord,
          this.asyncSearchPageIndex
        )
    },
    // 分页数据
    initData() {
      this.len = this.dataShowList.length
      this.total = Math.ceil(this.len / this.pageSize)
      this.pageIndex = 0
      this.pageData()
    },
    pageData() {
      this.checkedData = []
      if (this.total > 1 && this.pageIndex < this.total - 1) {
        this.pageIndex === 0
          ? (this.disabledPre = true)
          : (this.disabledPre = false)
        this.disabledNex = false
        this.districtListMock = this.dataShowList.slice(
          this.pageIndex * this.pageSize,
          this.pageIndex * this.pageSize + this.pageSize
        )
      } else {
        this.total > 1 ? (this.disabledPre = false) : (this.disabledPre = true)
        this.disabledNex = true
        this.districtListMock = this.dataShowList.slice(
          this.pageIndex * this.pageSize,
          this.len
        )
      }
    },
    // 异步获取的数据，检查分页按钮可用性
    asyncInitData() {
      // 取消勾选
      this.checkedData = []
      // 分页按钮可用性
      this.disabledNex = this.isLastPage
      this.disabledPre =
        this.asyncSearchFlag && this.asyncSearch
          ? this.asyncSearchPageIndex <= 1
          : this.asyncPageIndex <= 1
      // 赋值
      this.districtListMock = this.dataShowList
    },
    // 上一页
    prev() {
      if (this.async) {
        // 异步获取数据
        this.disabledPre = true
        this.asyncSearchFlag && this.asyncSearch
          ? this.$emit(
            'get-data-by-keyword',
            this.searchWord,
            this.asyncSearchPageIndex <= 1 ? 1 : --this.asyncSearchPageIndex
          )
          : this.$emit(
            'get-data',
            this.asyncPageIndex <= 1 ? 1 : --this.asyncPageIndex
          )
      } else {
        this.pageIndex > 0 && --this.pageIndex
        this.pageData()
      }
    },
    // 下一页
    next() {
      if (this.async) {
        // 异步获取数据
        this.disabledNex = true
        this.asyncSearchFlag && this.asyncSearch
          ? this.$emit(
            'get-data-by-keyword',
            this.searchWord,
            ++this.asyncSearchPageIndex
          )
          : this.$emit('get-data', ++this.asyncPageIndex)
      } else {
        this.pageIndex <= this.total - 1 && ++this.pageIndex
        this.pageData()
      }
    },
    // 单选
    handleCheckedChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.districtListMock.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.districtListMock.length
      // 子传父
      this.$emit('check-district', value)
    },
    // 全选
    handleCheckAllChange(val) {
      this.checkedData = val ? this.districtListMock.filter(val => !val.disabled).map((val) => val) : []
      this.isIndeterminate = false
      // 子传父
      this.$emit('check-district', this.checkedData)
    },
    clearInp() {
      this.$emit('clear-input')
    },
    filterHighlight(label) {
      const filterWord = this.searchWord.trim()
      label = label && label.trim()
      if (filterWord && label) {
        const reg = new RegExp(filterWord)
        return label.replace(reg, `<span style="color: ${this.highlightColor}">${filterWord}</span>`)
      } else {
        return label
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.district-panel {
  width: 280px;

  .el-transfer-panel__header {
    .el-checkbox {
      display: inline-block;

      >>> .el-checkbox__label {
        font-size: 14px;
      }
    }
  }
  .el-transfer-panel__body {
    height: 335px;
    //padding: 6px 0;

    .el-transfer-panel__filter {
      margin: 6px 14px;
      line-height: 0;

      .showClear {
        padding-right: 30px;
        border-radius: 0;
      }
      .clear-input {
        position: absolute;
        height: 100%;
        right: 10px;
        top: 0;
        text-align: center;
        color: #c0c4cc;
        transition: all 0.3s;
        line-height: 33px;
        visibility: hidden;
        opacity: 0;

        &:hover {
          color: #909399;
        }
      }

      &:hover {
        .clear-input {
          opacity: 1;
          visibility: visible;
        }
      }
    }
  }
  .el-checkbox-group {
    height: 295px;
    overflow: auto;
    &.expand {
      height: 290px;
    }

    .el-transfer-panel__item {
      display: block;
      line-height: 28px;
      height: 28px;

      >>> .el-checkbox__label  {
        font-weight: 400;
        line-height: 28px ;
      }

      >>> .el-checkbox__input {
        top: 7px;
      }
    }
  }
  .check-number {
    position: absolute;
    right: 15px;
    top: 0;
    color: #909399;
    font-size: 12px;
    font-weight: 400;
  }
  .no-data {
    font-size: 14px;
    margin: 0;
    height: 30px;
    line-height: 30px;
    padding: 6px 15px 0;
    color: #909399;
    text-align: center;
  }
  .vip-footer {
    display: flex;
    position: relative;
    margin: 0;
    text-align: center;
    border-top: 1px solid #ebeef5;

    .v-page {
      width: 50%;
      border: none;
      margin: 0;
      border-radius: 0;
      padding: 10px 15px;
      &:first-child {
        border-right: 1px solid #ebeef5;
      }
    }
  }
}
</style>
