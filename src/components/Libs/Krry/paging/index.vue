<template>
  <div class="krry-main">
    <el-row :gutter="10">
      <el-col :md="10" :sm="24">
        <krry-box
          ref="noSelect"
          :async="async"
          :async-search-flag="asyncSearchFlag"
          :data-show-list="notSelectDataList"
          :filter-placeholder="filterPlaceholder[0] || $tc('common.Search')"
          :filterable="filterable"
          :highlight-color="highlightColor"
          :is-highlight="isHighlight"
          :is-last-page="isLastPage"
          :operate-id="0"
          :page-size="pageSize"
          :page-texts="pageTexts"
          :show-clear-btn="showClearBtn"
          :title="boxTitle[0] || $tc('common.Selection')"
          @check-district="noCheckSelect"
          @search-word="searchWord"
          @check-disable="checkDisable"
          @get-data="getData"
          @get-data-by-keyword="getDataByKeyword"
          @clear-input="clearQueryInp('left')"
        />
      </el-col>
      <el-col :md="4" :sm="24" class="buttons">
        <div class="opera">
          <el-button
            :disabled="disablePre"
            class="el-transfer__button"
            icon="el-icon-arrow-left"
            size="mini"
            @click="deleteData"
          />
          <el-button
            :disabled="disableNex"
            class="el-transfer__button"
            icon="el-icon-arrow-right"
            size="mini"
            type="primary"
            @click="addData"
          />
        </div>
      </el-col>
      <el-col :md="10" :sm="24">
        <krry-box
          ref="hasSelect"
          :data-show-list="checkedData"
          :filter-placeholder="filterPlaceholder[1] || $tc('common.Search')"
          :filterable="filterable"
          :highlight-color="highlightColor"
          :is-highlight="isHighlight"
          :operate-id="1"
          :page-size="pageSize"
          :page-texts="pageTexts"
          :show-clear-btn="showClearBtn"
          :title="boxTitle[1] || $tc('common.Selected')"
          @check-district="hasCheckSelect"
          @search-word="searchWord"
          @check-disable="checkDisable"
          @clear-input="clearQueryInp('right')"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import krryBox from './models/box'

export default {
  name: 'KrryPaging',
  components: {
    krryBox
  },
  props: {
    boxTitle: {
      type: Array,
      // default: () => [this.$tc('common.Selection'), this.$tc('common.Selected')]
      default: () => ['', '']
    },
    pageSize: {
      type: Number,
      default: 160
    },
    dataList: {
      type: Array,
      default: () => []
    },
    selectedData: {
      type: Array,
      default: () => []
    },
    filterable: {
      type: Boolean,
      default: () => false
    },
    filterPlaceholder: {
      type: Array,
      default: () => ['', '']
      // default: () => [this.$tc('common.Search'), this.$tc('common.Search')]
    },
    pageTexts: {
      type: Array,
      default: () => ['', '']
      // default: () => ['< ' + this.$tc('common.PagePrev'), this.$tc('common.PageNext') + ' >']
    },
    sort: {
      type: Boolean,
      default: () => false
    },
    async: {
      type: Boolean,
      default: () => false
    },
    getPageData: {
      type: Function,
      default: () => []
    },
    getSearchData: {
      type: Function,
      default: () => []
    },
    isHighlight: {
      type: Boolean,
      default: () => false
    },
    highlightColor: {
      type: String,
      default: () => '#ff2b2b'
    },
    showClearBtn: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      notSelectDataList: [], // 未选中（已过滤出已选)的数据
      checkedData: [], // 已选中的数据

      dataListNoCheck: [], // 未搜索的数据
      selectListCheck: [], // 未搜索的数据

      noCheckData: [], // 未选中区域的已勾选的数据（待添加到已选区域)
      hasCheckData: [], // 已选中区域的已勾选的数据（从未选区域中待删除)

      noSelectKeyword: '',
      haSelectKeyword: '',

      disablePre: true,
      disableNex: true,

      manualEmpty: false, // 是否手动将已选区数据置为空

      asyncDataList: [], // 异步请求的数据源
      isLastPage: false // 异步请求是否是最后一页
    }
  },
  computed: {
    // 传递到后台保存的数据（已选中的数据的 id 数组）
    selectIdList() {
      return this.selectListCheck.map(item => item.id)
    },
    originList() {
      return this.async ? this.asyncDataList : this.dataList
    },
    asyncSearchFlag() {
      // 是否设置了异步搜索方法
      return this.async && this.getSearchData !== undefined
    }
  },
  watch: {
    selectIdList(newVal) {
      // 获取已选数据的监听事件
      const moveKeys = [
        ...this.noCheckData.map(item => item.id),
        ...this.hasCheckData.map(item => item.id)
      ]
      this.hasCheckData = []
      this.noCheckData = []
      this.$emit('onChange', newVal, moveKeys)
    },
    dataList: {
      handler() {
        !this.async && this.initData()
      },
      deep: true
    },
    selectedData: {
      handler() {
        this.initData(true)
      },
      deep: true
    }
  },
  created() {
    this.async ? this.getData(1, true) : this.initData(true)
  },
  methods: {
    // 分页数据，初始化数据，过滤已选数据
    initData(selectedChange) {
      // this.checkedData 为空 且 从来没有将已选区置为空，则从 selectedData 获取
      if ((!this.checkedData.length && !this.manualEmpty) || selectedChange) {
        this.checkedData = JSON.parse(JSON.stringify(this.selectedData))
        const keywords = this.$refs.hasSelect
          ? this.$refs.hasSelect.searchWord
          : ''
        keywords && this.searchWord(keywords, 1)
      }
      if (!this.async) {
        this.selectListCheck = JSON.parse(JSON.stringify(this.checkedData))
        const checkDataId = this.selectListCheck.map(ele => ele.id)
        this.notSelectDataList = this.originList.filter(
          ele => !checkDataId.includes(ele.id)
        )
        this.dataListNoCheck = JSON.parse(
          JSON.stringify(this.notSelectDataList)
        )
      } else {
        if (selectedChange) {
          this.selectListCheck = JSON.parse(JSON.stringify(this.checkedData))
        }
        const checkDataId = this.selectListCheck.map(ele => ele.id)
        this.notSelectDataList = this.originList.filter(
          ele =>
            !checkDataId.includes(ele.id) &&
            (ele.label.includes(this.noSelectKeyword) || this.asyncSearchFlag)
        )
        this.dataListNoCheck = this.originList.filter(
          ele => !checkDataId.includes(ele.id)
        )
      }
    },
    searchWord(keyword, titleId) {
      // 过滤掉数据，保留搜索的数据
      // 如果设置了异步搜索，就不用过滤关键词 this.asyncSearchFlag 为 true
      if (titleId === 0) {
        this.noSelectKeyword = keyword
        if (!this.asyncSearchFlag) {
          this.notSelectDataList = this.dataListNoCheck.filter(val =>
            val.label.includes(keyword)
          )
        }
      } else {
        this.haSelectKeyword = keyword
        this.checkedData = this.selectListCheck.filter(val =>
          val.label.includes(keyword)
        )
      }
      const refsName = titleId === 0 ? 'noSelect' : 'hasSelect'
      // 延迟执行
      setTimeout(() => {
        !this.async && this.$refs[refsName].initData()
      }, 0)
    },
    // 检查左右按钮可用性
    checkDisable(data, operateId) {
      if (operateId === 0) {
        this.disableNex = !(data.length > 0)
      } else {
        this.disablePre = !(data.length > 0)
      }
    },
    // 未选中区域的选泽
    noCheckSelect(val) {
      this.noCheckData = val
    },
    // 已选中区域的选泽
    hasCheckSelect(val) {
      this.hasCheckData = val
    },
    // 关键：把未选择的数据当做已选择的过滤数组，把已选择的数据当做未选择的过滤数组，在全局data进行过滤，最后进行一次搜索
    // 添加至已选
    addData() {
      const noCheckDataId = this.noCheckData.map(ele => ele.id)
      // 待选区数据过滤
      // 如果设置了异步搜索，就不用过滤关键词 this.asyncSearchFlag 为 true
      this.notSelectDataList = this.notSelectDataList.filter(
        ele =>
          !noCheckDataId.includes(ele.id) &&
          (ele.label.includes(this.noSelectKeyword) || this.asyncSearchFlag)
      )
      this.dataListNoCheck = this.dataListNoCheck.filter(
        ele => !noCheckDataId.includes(ele.id)
      )
      // 已选区数据增加
      if (!this.async && this.sort) {
        // 排序，从固定不变的所有数据中过滤，顺序就不会乱。但若数据量大就会比较卡
        // 异步分页不支持排序
        const dataListNoCheckId = this.dataListNoCheck.map(ele => ele.id)
        this.checkedData = this.originList.filter(
          ele =>
            !dataListNoCheckId.includes(ele.id) &&
            ele.label.includes(this.haSelectKeyword)
        )
        this.selectListCheck = this.originList.filter(
          ele => !dataListNoCheckId.includes(ele.id)
        )
      } else {
        // 这种效率更高的方法，但不能排序
        this.checkedData.push(...this.noCheckData)
        this.selectListCheck.push(...this.noCheckData)
        this.checkedData = this.checkedData.filter(ele =>
          ele.label.includes(this.haSelectKeyword)
        )
      }
    },
    // 从已选中删除
    deleteData() {
      // 已选区数据过滤
      const hasCheckDataId = this.hasCheckData.map(ele => ele.id)
      this.checkedData = this.checkedData.filter(
        ele =>
          !hasCheckDataId.includes(ele.id) &&
          ele.label.includes(this.haSelectKeyword)
      )
      this.selectListCheck = this.selectListCheck.filter(
        ele => !hasCheckDataId.includes(ele.id)
      )

      this.manualEmpty = !this.checkedData.length

      // 待选区数据增加
      const selectListCheckId = this.selectListCheck.map(ele => ele.id)
      // const checkedDataId = this.checkedData.map(ele => ele.id)
      // 如果设置了异步搜索，就不用过滤关键词 this.asyncSearchFlag 为 true
      this.notSelectDataList = this.originList.filter(
        ele =>
          !selectListCheckId.includes(ele.id) &&
          (ele.label.includes(this.noSelectKeyword) || this.asyncSearchFlag)
      )
      this.dataListNoCheck = this.originList.filter(
        ele => !selectListCheckId.includes(ele.id)
      )
    },
    // 提供获取已选数据的钩子
    getSelectedData() {
      return this.selectIdList
    },
    clearQueryInp(position) {
      switch (position) {
        case 'left':
          this.$refs.noSelect.searchWord = ''
          this.asyncSearchFlag && this.getDataByKeyword('')
          break
        case 'right':
          this.$refs.hasSelect.searchWord = ''
          break
        default:
          break
      }
    },
    async getDataByKeyword(keyword, pageIndex) {
      keyword = keyword.trim()
      if (keyword) {
        this.$nextTick(() => {
          this.$refs.noSelect.asyncSearch = true
        })
        const resData = await this.getSearchData(
          keyword,
          pageIndex,
          this.pageSize
        )
        if (Array.isArray(resData) && resData.length) {
          this.asyncDataList = resData
          this.notSelectDataList = resData
          this.initData()
          this.isLastPage = resData.length < this.pageSize
        } else {
          this.notSelectDataList = []
          this.isLastPage = true
        }
      } else {
        this.$refs.noSelect.asyncSearch = false
        await this.getData(1)
      }
    },
    async getData(pageIndex, changed = false) {
      this.$nextTick(() => {
        // 设置异步分页的 pageIndex
        this.$refs.noSelect.asyncPageIndex = pageIndex
        // 清空左侧输入框
        this.$refs.noSelect.searchWord = ''
        // asyncSearch 设置为 true
        this.$refs.noSelect.asyncSearch = false
      })
      const resData = await this.getPageData(pageIndex, this.pageSize)
      if (Array.isArray(resData) && resData.length) {
        this.asyncDataList = resData
        this.notSelectDataList = resData
        // 这里必须是 true，否则右侧不能搜索, 一搜索确认就不行了
        this.initData(changed)
        this.isLastPage = resData.length < this.pageSize
      } else {
        this.notSelectDataList = []
        this.isLastPage = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.krry-main {
  min-width: 600px;
}
.inner-center {
  margin: 0 5px;
}

.buttons {
  vertical-align: middle;
}
.opera {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  margin: 180px 8px;
  width: 100%;
  @media screen and (max-width: 992px) {
    margin: 8px 8px;
    text-align:start
  }

  .el-button.is-circle {
    border-radius: 50%;
    padding: 12px;
    display: block;
    margin: 25px auto;
  }
  .el-transfer__button {
    padding: 5px;
  }
}
.el-transfer-panel__filter .el-input__inner {
  border-radius: 0;
}

</style>
