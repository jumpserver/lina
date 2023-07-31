<template>
  <div class="el-data-table">
    <template v-if="showNoData">
      <!--@slot 获取数据为空时的内容-->
      <slot name="no-data" />
    </template>
    <template v-else>
      <el-table
        ref="table"
        v-loading="loading"
        :data="data"
        :row-class-name="rowClassName"
        v-bind="tableAttrs"
        @select="selectStrategy.onSelect"
        v-on="$listeners"
        @selection-change="selectStrategy.onSelectionChange"
        @select-all="selectStrategy.onSelectAll($event, canSelect)"
        @sort-change="onSortChange"
      >
        <!--TODO 不用jsx写, 感觉template逻辑有点不清晰了-->
        <template v-if="isTree">
          <!--有多选-->
          <template v-if="hasSelect">
            <el-data-table-column
              key="selection-key"
              v-bind="{align: columnsAlign, ...columns[0]}"
            />

            <el-data-table-column
              key="tree-ctrl"
              v-bind="{align: columnsAlign, ...columns[1]}"
            >
              <template slot-scope="scope">
                <span
                  v-for="space in scope.row._level"
                  :key="space"
                  class="ms-tree-space"
                />
                <span
                  v-if="iconShow(scope.$index, scope.row)"
                  class="tree-ctrl"
                  @click="toggleExpanded(scope.$index)"
                >
                  <i
                    :class="`el-icon-${scope.row._expanded ? 'minus' : 'plus'}`"
                  />
                </span>
                {{ scope.row[columns[1].prop] }}
              </template>
            </el-data-table-column>

            <el-data-table-column
              v-for="col in columns.filter((c, i) => i !== 0 && i !== 1)"
              :key="col.prop"
              v-bind="{align: columnsAlign, ...col}"
            />
          </template>

          <!--无选择-->
          <template v-else>
            <!--展开这列, 丢失 el-data-table-column属性-->
            <el-data-table-column
              key="tree-ctrl"
              v-bind="{align: columnsAlign, ...columns[0]}"
            >
              <template slot-scope="scope">
                <span
                  v-for="space in scope.row._level"
                  :key="space"
                  class="ms-tree-space"
                />

                <span
                  v-if="iconShow(scope.$index, scope.row)"
                  class="tree-ctrl"
                  @click="toggleExpanded(scope.$index)"
                >
                  <i :class="`el-icon-${scope.row._expanded ? 'minus' : 'plus'}`" />
                </span>
                {{ scope.row[columns[0].prop] }}
              </template>
            </el-data-table-column>

            <el-data-table-column
              v-for="col in columns.filter((c, i) => i !== 0)"
              :key="col.prop"
              v-bind="{align: columnsAlign, ...col}"
            />
          </template>
        </template>

        <!--非树-->
        <template v-else>
          <el-data-table-column v-if="hasSelection" :align="selectionAlign" :selectable="canSelect" type="selection" />
          <el-data-table-column
            v-for="col in columns"
            :key="col.prop"
            :filter-method="typeof col.filterMethod === 'function' ? col.filterMethod : null"
            :filter-multiple="false"
            :filters="col.filters || null"
            :formatter="typeof col.formatter === 'function' ? col.formatter : null"
            v-bind="{align: columnsAlign, ...col}"
          >
            <template v-if="col.formatter && typeof col.formatter !== 'function'" v-slot:default="{row, column, index}">
              <div
                :is="col.formatter"
                :key="row.id"
                :cell-value="row[col.prop]"
                :col="col"
                :column="column"
                :index="index"
                :reload="getList"
                :row="row"
                :table-data="data"
                :url="url"
              />
            </template>
          </el-data-table-column>
        </template>
        <slot />
      </el-table>

      <el-pagination
        v-if="hasPagination"
        :background="paginationBackground"
        :current-page="page"
        :layout="paginationLayout"
        :page-size="size"
        :page-sizes="paginationSizes"
        :total="total"
        v-bind="extraPaginationAttrs"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />

      <the-dialog
        ref="dialog"
        :button-size="buttonSize"
        :dialog-attrs="dialogAttrs"
        :edit-title="dialogEditTitle"
        :form="form"
        :form-attrs="formAttrs"
        :new-title="dialogNewTitle"
        :view-title="dialogViewTitle"
        @confirm="onConfirm"
      >
        <template v-slot="scope">
          <!-- @slot 表单作用域插槽。当编辑、查看时传入row；新增时row=null -->
          <slot :row="scope.row" name="form" />
        </template>
      </the-dialog>
    </template>
  </div>
</template>

<script>
import _get from 'lodash.get'
import _values from 'lodash.values'
import _isEmpty from 'lodash.isempty'
import SelfLoadingButton from './components/self-loading-button.vue'
import TheDialog, { dialogModes } from './components/the-dialog.vue'
import ElDataTableColumn from './components/el-data-table-column'
import * as queryUtil from './utils/query'
import getSelectStrategy from './utils/select-strategy'
import getLocatedSlotKeys from './utils/extract-keys'
import transformSearchImmediatelyItem from './utils/search-immediately-item'
import isFalsey from './utils/is-falsey'
import merge from 'deepmerge'

const defaultFirstPage = 1
const noPaginationDataPath = 'payload'

export default {
  name: 'ElDataTable',
  components: {
    SelfLoadingButton,
    TheDialog,
    ElDataTableColumn
  },

  props: {
    /**
     * 请求url, 如果为空, 则不会发送请求; 改变url, 则table会重新发送请求
     */
    url: {
      type: String,
      default: ''
    },
    /**
     * 主键，默认值 id，
     * 修改/删除时会用到,请求会根据定义的属性值获取主键,即row[this.id]
     */
    id: {
      type: String,
      default: 'id'
    },
    /**
     * 分页请求的第一页的值(有的接口0是第一页)
     */
    firstPage: {
      type: Number,
      default: defaultFirstPage
    },
    /**
     * 渲染组件的分页数据在接口返回的数据中的路径, 嵌套对象使用.表示即可
     */
    dataPath: {
      type: String,
      default: 'payload.content'
    },
    /**
     * 分页数据的总数在接口返回的数据中的路径, 嵌套对象使用.表示即可
     */
    totalPath: {
      type: String,
      default: 'payload.totalElements'
    },
    /**
     * 请求的时候如果接口需要的页码的查询 key 不同的时候可以指定
     */
    pageKey: {
      type: String,
      default: 'page'
    },
    /**
     * 请求的时候如果接口需要的分页数量的查询 key 不同的时候可以指定
     */
    pageSizeKey: {
      type: String,
      default: 'size'
    },
    /**
     * 列属性设置, 详情见element-ui官网
     * @link https://element.eleme.cn/2.4/#/zh-CN/component/table#table-column-attributes
     */
    columns: {
      type: Array,
      default() {
        return []
      }
    },
    /**
     * 请求之前可以转换query的内容, 提供一种方式可以让自定义query, 如有的分页用的是offset机制, offset = page * size, limit = size
     */
    transformQuery: {
      type: Function,
      default: null
    },
    /**
     * 查询字段渲染, 配置参考el-form-renderer
     * @link https://femessage.github.io/el-form-renderer/
     */
    searchForm: {
      type: Array,
      default() {
        return []
      }
    },
    /**
     * 是否开启搜索栏折叠功能
     */
    canSearchCollapse: {
      type: Boolean,
      default: false
    },
    /**
     * 点击查询按钮, 查询前执行的函数，参数form表单数据，需要返回Promise
     */
    beforeSearch: {
      type: Function,
      default() {
      }
    },
    /**
     * 单选, 适用场景: 不可以批量删除
     */
    single: {
      type: Boolean,
      default: false
    },
    /**
     * 切换页面时，已勾选项不会丢失
     */
    persistSelection: {
      type: Boolean,
      default: false
    },
    /**
     * 是否有操作列
     */
    hasOperation: {
      type: Boolean,
      default: true
    },
    /**
     * 操作列的自定义按钮, 渲染的是element-ui的button, 支持包括style在内的以下属性:
     * {type: '', text: '', atClick: row => Promise.resolve(), show: row => return true时显示, disabled: row => return true时禁用 }
     * 点击事件 row参数 表示当前行数据, 需要返回Promise, 默认点击后会刷新table, resolve(false) 则不刷新
     */
    extraButtons: {
      type: Array,
      default() {
        return []
      }
    },
    /**
     * 头部的自定义按钮, 渲染的是element-ui的button, 支持包括style在内的以下属性:
     * {type: '', text: '', atClick: selected => Promise.resolve(), show: selected => return true时显示, disabled: selected => return true时禁用}
     * 点击事件 selected参数 表示选中行所组成的数组, 函数需要返回Promise, 默认点击后会刷新table, resolve(false) 则不刷新
     */
    headerButtons: {
      type: Array,
      default() {
        return []
      }
    },
    /**
     * 是否有新增按钮
     */
    hasNew: {
      type: Boolean,
      default: true
    },
    /**
     * 是否有动作按钮
     */
    hasAction: {
      type: Boolean,
      default: true
    },
    /**
     * 是否有动作按钮
     */
    hasUpload: {
      type: Boolean,
      default: true
    },
    /**
     * 是否有编辑按钮
     */
    hasEdit: {
      type: Boolean,
      default: true
    },
    /**
     * 是否有查看按钮
     */
    hasView: {
      type: Boolean,
      default: false
    },
    /**
     * table头部是否有删除按钮(该按钮要多选时才会出现)
     */
    hasDelete: {
      type: Boolean,
      default: true
    },
    /**
     * 新增按钮文案
     */
    newText: {
      type: String,
      default: function() {
        return this.$t('ops.Add')
      }
    },
    /**
     * 修改按钮文案
     */
    editText: {
      type: String,
      default: function() {
        return this.$t('ops.Modify')
      }
    },
    /**
     * 查看按钮文案
     */
    viewText: {
      type: String,
      default: function() {
        return this.$t('ops.View')
      }
    },
    /**
     * 删除按钮文案
     */
    deleteText: {
      type: String,
      default: function() {
        return this.$t('ops.Delete')
      }
    },
    /**
     * 删除提示语。接受要删除的数据（单个对象或数组）；返回字符串
     * @param {object|object[]} 要删除的数据 - 单个对象或数组
     * @return {string}
     */
    deleteMessage: {
      type: Function,
      default() {
        return this.$t('ops.Confirm') + this.deleteText + '?'
      }
    },
    /**
     * 某行数据是否可以删除, 返回true表示可以, 控制的是单选时单行的删除按钮
     */
    canDelete: {
      type: Function,
      default() {
        return true
      }
    },
    canEdit: {
      type: Function,
      default() {
        return true
      }
    },
    /**
     * 点击新增按钮时的方法, 当默认新增方法不满足需求时使用, 需要返回promise
     * 参数(data, row) data 是form表单的数据, row 是当前行的数据, 只有isTree为true时, 点击操作列的新增按钮才会有值
     */
    onNew: {
      type: Function,
      default(data) {
        return this.$axios.post(this.url, data, this.axiosConfig)
      }
    },
    /**
     * 点击修改按钮时的方法, 当默认修改方法不满足需求时使用, 需要返回promise
     * 参数(data, row) data 是form表单的数据, row 是当前行的数据
     */
    onEdit: {
      type: Function,
      default(row) {
      }
    },
    /**
     * 点击删除按钮时的方法, 当默认删除方法不满足需求时使用, 需要返回promise
     * 多选时, 参数为selected, 代表选中的行组成的数组; 非多选时参数为row, 代表单行的数据
     */
    onDelete: {
      type: Function,
      default(data) {
        const ids = Array.isArray(data)
          ? data.map(v => v[this.id]).join(',')
          : data[this.id]
        return this.$axios.delete(this.url + '/' + ids + '/', this.axiosConfig)
      }
    },
    /**
     * crud 操作成功后会调用的函数，默认是 this.$message.success('操作成功')
     * 接受两个参数：
     * type，操作的类型，可能的值有 new | edit | delete；
     * data，操作的数据对象
     */
    onSuccess: {
      type: Function,
      default() {
        return this.$message.success(this.$t('ops.SuccessfulOperation'))
      }
    },
    /**
     * 是否分页。如果不分页，则请求传参page=-1
     */
    hasPagination: {
      type: Boolean,
      default: true
    },
    /**
     * 分页组件的子组件布局，子组件名用逗号分隔，对应element-ui pagination的layout属性
     * @link https://element.eleme.cn/2.4/#/zh-CN/component/pagination
     */
    paginationLayout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    /**
     * 分页组件的每页显示个数选择器的选项设置，对应element-ui pagination的page-sizes属性
     * @link https://element.eleme.cn/2.4/#/zh-CN/component/pagination
     */
    paginationSizes: {
      type: Array,
      default: () => [10, 20, 30, 40, 50]
    },
    paginationPagerCount: {
      type: Number,
      default: 5
    },
    /**
     * 分页组件的每页显示个数选择器默认选项，对应element-ui pagination的page-size属性
     * @link https://element.eleme.cn/2.4/#/zh-CN/component/pagination
     */
    paginationSize: {
      type: Number,
      default: 10
    },
    /**
     * @deprecated
     * 不分页时的size的大小(建议接口约定，不分页时传参page=-1，故一般不会用到此属性)
     */
    noPaginationSize: {
      type: Number,
      default: 999
    },
    /**
     * 要渲染的数据是否是树形结构
     */
    isTree: {
      type: Boolean,
      default: false
    },
    /**
     * 树形结构相关: 子节点的字段名
     */
    treeChildKey: {
      type: String,
      default: 'children'
    },
    /**
     * 树形结构相关: 父节点的字段名
     */
    treeParentKey: {
      type: String,
      default: 'parentId'
    },
    /**
     * 树形结构相关: 父节点字段值的来源字段。
     * 新增/修改时会用到, 例如, 在id为2的节点新增子节点, 则子节点的parentId为2, 也即parentId的值来源于字段id, 故treeParentValue为id
     */
    treeParentValue: {
      type: String,
      default: 'id'
    },
    /**
     * 树形结构相关: 是否展开所有节点
     */
    expandAll: {
      type: Boolean,
      default: false
    },
    /**
     * element table 属性设置, 详情配置参考element-ui官网
     * @link https://element.eleme.cn/2.4/#/zh-CN/component/table#table-attributes
     */
    tableAttrs: {
      type: Object,
      default() {
        return {}
      }
    },
    /**
     * 操作列属性
     * @link https://element.eleme.cn/2.4/#/zh-CN/component/table#table-column-attributes
     */
    operationAttrs: {
      type: Object,
      default() {
        return { width: '', fixed: 'right' }
      }
    },
    /**
     * 新增弹窗的标题，默认为newText的值
     */
    dialogNewTitle: {
      type: String,
      default() {
        return this.newText
      }
    },
    /**
     * 修改弹窗的标题，默认为editText的值
     */
    dialogEditTitle: {
      type: String,
      default() {
        return this.editText
      }
    },
    /**
     * 查看弹窗的标题，默认为viewText的值
     */
    dialogViewTitle: {
      type: String,
      default() {
        return this.viewText
      }
    },
    /**
     * 弹窗表单, 用于新增与修改, 详情配置参考el-form-renderer
     * @link https://femessage.github.io/el-form-renderer/
     */
    form: {
      type: Array,
      default() {
        return []
      }
    },
    /**
     * 弹窗表单属性设置, 详情配置参考element-ui官网
     * @link https://element.eleme.cn/2.4/#/zh-CN/component/form#form-attributes
     */
    formAttrs: {
      type: Object,
      default() {
        return {}
      }
    },
    /**
     * 对话框属性设置, 详情配置参考element-ui官网
     * @link https://element.eleme.cn/2.4/#/zh-CN/component/dialog#attributes
     */
    dialogAttrs: {
      type: Object,
      default() {
        return {}
      }
    },
    /**
     * 同extraBody
     * @deprecated
     */
    extraParams: {
      type: Object,
      default() {
        return undefined
      }
    },
    /**
     * 新增/修改提交时，请求体带上额外的参数。
     */
    extraBody: {
      type: Object,
      default() {
        return undefined
      }
    },
    /**
     * 在新增/修改弹窗 点击确认时调用，返回Promise, 如果reject, 则不会发送新增/修改请求
     * 参数: (data, isNew) data为表单数据, isNew true 表示是新增弹窗, false 为 编辑弹窗
     */
    beforeConfirm: {
      type: Function,
      default() {
        return Promise.resolve()
      }
    },
    /**
     * 同extraQuery
     * @deprecated
     */
    customQuery: {
      type: Object,
      default() {
        return undefined
      }
    },
    /**
     * 向请求url添加的额外参数。
     * 可用.sync修饰，此时点击重置按钮后该参数也会被重置
     */
    extraQuery: {
      type: Object,
      default() {
        return {}
      }
    },
    /**
     * 是否开启使用url保存query参数的功能
     */
    saveQuery: {
      type: Boolean,
      default: true
    },
    /**
     * 操作栏按钮类型
     * `text` 为文本按钮, `button` 为普通按钮
     */
    operationButtonType: {
      type: String,
      default: 'text'
    },
    /**
     * 设置 `按钮` 大小
     * @see https://element.eleme.cn/#/zh-CN/component/button#bu-tong-chi-cun
     */
    buttonSize: {
      type: String,
      default: 'small'
    },
    /**
     * 设置axios的config参数
     */
    axiosConfig: {
      type: Object,
      default() {
        return {}
      }
    },
    /*
    * 设置默认对齐方式
    */
    defaultAlign: {
      type: String,
      default: 'center'
    },
    selectionAlign: {
      type: String,
      default: 'center'
    },
    paginationBackground: {
      type: Boolean,
      default: true
    },
    extraPaginationAttrs: {
      type: Object,
      default: () => {
      }
    },
    hasSelection: {
      type: Boolean,
      default: true
    },
    hasDetail: {
      type: Boolean,
      default: true
    },
    canSelect: {
      type: Function,
      default(row, index) {
        return true
      }
    },
    totalData: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      data: [],
      size: this.paginationSize || this.paginationSizes[0],
      page: defaultFirstPage,
      // https://github.com/ElemeFE/element/issues/1153
      total: null,
      loading: false,
      // 多选项的数组
      selected: [],

      // 要修改的那一行
      row: {},

      // 初始的extraQuery值, 重置查询时, 会用到
      // JSON.stringify是为了后面深拷贝作准备
      initExtraQuery: JSON.stringify(this.extraQuery || this.customQuery || {}),
      isSearchCollapse: false,
      showNoData: false,
      innerQuery: {}
    }
  },
  computed: {
    hasSelect() {
      return this.columns.length && this.columns[0].type === 'selection'
    },
    selectable() {
      if (this.hasSelect && this.columns[0].selectable) {
        return this.columns[0].selectable
      }
      return () => true
    },
    columnsAlign() {
      if (this.columns.some(col => col.columns && col.columns.length)) {
        // 多级表头默认居中
        return 'center'
      } else {
        // 默认居中 //修改点
        return this.defaultAlign
      }
    },
    routerMode() {
      return this.$router ? this.$router.mode : 'hash'
    },
    hasSearchForm() {
      return this.searchForm.length || this.$slots.search
    },
    hasHeader() {
      return (
        this.hasNew ||
        (this.hasSelect && this.hasDelete) ||
        this.headerButtons.length ||
        this.canSearchCollapse ||
        this.$scopedSlots.header
      )
    },
    _extraBody() {
      return this.extraBody || this.extraParams || {}
    },
    _extraQuery() {
      return this.extraQuery || this.customQuery || {}
    },
    selectStrategy() {
      return getSelectStrategy(this)
    },
    searchLocatedSlotKeys() {
      return getLocatedSlotKeys(this.$slots, 'search:')
    },
    collapseForm() {
      return this.searchForm.map(item => {
        if ('collapsible' in item && !item.collapsible) {
          return item
        }

        const itemHidden = item.hidden || (() => false)
        return {
          ...item,
          hidden: data => {
            return this.isSearchCollapse || itemHidden(data)
          }
        }
      })
    },
    _searchForm() {
      return transformSearchImmediatelyItem(this.collapseForm, this)
    },
    lastPageNum() {
      // page
      const pageOffset = this.firstPage - defaultFirstPage
      const pageCount = Math.ceil(this.total / this.size)
      const lastPageNum = pageCount + pageOffset
      return lastPageNum
    }
  },
  watch: {
    url: {
      handler(val) {
        if (!val) return
        this.page = defaultFirstPage
        // mounted处有updateForm的行为，所以至少在初始执行时要等到nextTick
        this.$nextTick(this.getList)
      },
      immediate: true
    },
    selected(val) {
      /**
       * 多选项发生变化
       * @property {array} rows - 已选中的行数据的数组
       */
      this.$emit('selection-change', val)
    },
    totalData(val) {
      if (val && val.length !== this.total) {
        this.page = defaultFirstPage
        this.total = val.length
        this.getList()
      }
    }
  },
  mounted() {
    if (this.saveQuery) {
      const query = queryUtil.get(location.href)
      if (query) {
        this.page = parseInt(query[this.pageKey])
        this.size = parseInt(query[this.pageSizeKey])
        // 恢复查询条件，但对slot=search无效
        if (this.$refs.searchForm) {
          delete query[this.pageKey]
          delete query[this.pageSizeKey]
          this.$refs.searchForm.updateForm(query)
        }
      }
    }
    if (this.totalData) {
      this.getList()
    }
  },
  methods: {
    getQuery() {
      // 构造query对象
      let query = {}
      let formValue = {}
      if (this.$refs.searchForm) {
        formValue = this.$refs.searchForm.getFormValue()
        Object.assign(query, formValue)
      }
      Object.assign(query, this._extraQuery)
      Object.assign(query, this.innerQuery)
      query[this.pageSizeKey] = this.hasPagination
        ? this.size
        : this.noPaginationSize

      // 根据偏移值计算接口正确的页数
      const pageOffset = this.firstPage - defaultFirstPage
      query[this.pageKey] = this.hasPagination ? this.page + pageOffset : -1

      // 无效值过滤，注意0是有效值
      query = Object.keys(query)
        .filter(k => !isFalsey(query[k]))
        .reduce((obj, k) => {
          obj[k] = query[k].toString().trim()
          return obj
        }, {})

      if (this.transformQuery) {
        query = this.transformQuery(query)
      }
      return query
    },
    getPageData() {
      return this.data
    },
    async gotoNextPage() {
      if (!this.hasNextPage()) {
        return false
      }
      this.page += 1
      await this.getList({ loading: true })
    },
    hasNextPage() {
      return this.page < this.lastPageNum
    },
    getList({ loading = true } = {}) {
      const { url } = this
      if (url) {
        return this.getListFromRemote({ loading: loading })
      }
      if (this.totalData) {
        return this.getListFromStaticData({ loading: true })
      }
      // this.$log.debug("last page is: ", this.lastPageNum)
    },
    getListFromStaticData({ loading = true } = {}) {
      if (loading) {
        this.loading = true
      }
      if (!this.hasPagination) {
        this.data = this.totalData
        this.loading = false
        if (this.isTree) {
          this.data = this.tree2Array(this.data, this.expandAll)
        }
        return this.data
      }
      // page
      const pageOffset = this.firstPage - defaultFirstPage
      const page = this.page === 0 ? 1 : this.page
      const start = (page + pageOffset - 1) * this.size
      const end = (page + pageOffset) * this.size
      this.$log.debug(`page: ${page}, size: ${this.size}, start: ${start}, end: ${end}`)
      this.data = this.totalData.slice(start, end)
      this.loading = false
      this.data = this.tree2Array(this.data, this.expandAll)
      return this.data
    },
    /**
     * 手动刷新列表数据，选项的默认值为: { loading: true }
     * @public
     * @param {object} options 方法选项
     */
    getListFromRemote({ loading = true } = {}) {
      const { url } = this
      if (!url) {
        return
      }

      const query = this.getQuery()
      let formValue = {}
      if (this.$refs.searchForm) {
        formValue = this.$refs.searchForm.getFormValue()
        Object.assign(query, formValue)
      }
      const queryStr =
        (url.indexOf('?') > -1 ? '&' : '?') +
        queryUtil.stringify(query, '=', '&')

      // 请求开始
      this.loading = loading

      // 存储query记录, 便于后面恢复
      if (this.saveQuery) {
        // 存储的page是table的页码，无需偏移
        query[this.pageKey] = this.page
        const newUrl = queryUtil.set(location.href, query, this.routerMode)
        history.replaceState(history.state, 'el-data-table search', newUrl)
      }

      this.$axios
        .get(url + queryStr, this.axiosConfig)
        .then(({ data: resp }) => {
          let data = []

          // 不分页
          if (!this.hasPagination) {
            data =
              _get(resp, this.dataPath) ||
              _get(resp, noPaginationDataPath) ||
              []
            this.total = data.length
          } else {
            data = _get(resp, this.dataPath) || []
            // 获取不到值得时候返回 undefined, el-pagination 接收一个 null 或者 undefined 会导致没数据但是下一页可点击
            this.total = _get(resp, this.totalPath) || 0
          }

          this.data = data

          // 树形结构逻辑
          if (this.isTree) {
            this.data = this.tree2Array(data, this.expandAll)
          }

          this.showNoData =
            this.$slots['no-data'] &&
            this.total === 0 &&
            (_isEmpty(formValue) || _values(formValue).every(isFalsey))

          this.loading = false
          /**
           * 请求返回, 数据更新后触发
           * @property {object} data - table的数据
           * @property {object} resp - 请求返回的完整response
           */
          this.$emit('update', data, resp)

          // 开启persistSelection时，需要同步selected状态到el-table中
          this.$nextTick(() => {
            this.selectStrategy.updateElTableSelection()
          })
        })
        .catch(err => {
          /**
           * 请求数据失败，返回err对象
           * @event error
           */
          this.$emit('error', err)
          this.total = 0
          this.loading = false
        })
    },
    search(attrs, reset) {
      // 重置搜索结果到第一页
      this.page = defaultFirstPage
      // Orange 重置查询对象
      if (reset) {
        this.innerQuery = merge({}, attrs)
      } else {
        this.innerQuery = merge(this.innerQuery, attrs)
      }
      this.selected.splice(0, this.selected.length)
      return this.getList()
    },
    searchDate(attrs) {
      // 重置搜索结果到第一页
      this.page = defaultFirstPage
      this.innerQuery = merge(this.innerQuery, attrs)
      return this.getList()
    },

    /**
     * 重置查询，相当于点击「重置」按钮
     *
     * @public
     */
    resetSearch() {
      // reset后, form里的值会变成 undefined, 在下一次查询会赋值给query
      this.$refs.searchForm.resetFields()
      this.page = defaultFirstPage

      // 重置
      if (this.saveQuery) {
        const newUrl = queryUtil.clear(location.href)
        history.replaceState(history.state, '', newUrl)
      }

      /**
       * 按下重置按钮后触发
       */
      this.$emit('reset')

      this.$emit('update:customQuery', JSON.parse(this.initExtraQuery))
      this.$emit('update:extraQuery', JSON.parse(this.initExtraQuery))

      this.$nextTick(() => {
        this.getList()
      })
    },
    handleSizeChange(val) {
      if (this.size === val) return
      this.$emit('sizeChange', val)
      this.page = defaultFirstPage
      this.size = val
      this.getList()
    },
    handleCurrentChange(val) {
      if (this.page === val) return

      this.page = val
      this.getList()
    },
    /**
     * 切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否
     *
     * @public
     * @param {object} row - 要更新的数据行
     * @param {boolean} isSelected - 是否被勾选
     */
    toggleRowSelection(row, isSelected) {
      return this.selectStrategy.toggleRowSelection(row, isSelected)
    },
    /**
     * 清空多选项
     *
     * @public
     */
    clearSelection() {
      return this.selectStrategy.clearSelection()
    },
    // 弹窗相关
    // 除非树形结构在操作列点击新增, 否则 row 是 MouseEvent
    onDefaultNew(row) {
      // 屏蔽默认New方法
      this.onNew()
    },
    onDefaultView(row) {
      this.row = row
      this.$refs.dialog.show(dialogModes.view, row)
    },
    onDefaultEdit(row) {
      this.row = row
      this.onEdit(row)
    },
    async onConfirm(isNew, formValue, done) {
      const data = {
        ...formValue,
        ...this._extraBody
      }

      if (this.isTree) {
        data[this.treeParentKey] = isNew
          ? this.row[this.treeParentValue]
          : this.row[this.treeParentKey]
      }

      try {
        await this.beforeConfirm(data, isNew)
        if (isNew) {
          await this.onNew(data, this.row)
        } else {
          await this.onEdit(data, this.row)
        }
        this.getList()
        this.onSuccess(isNew ? 'new' : 'edit', data)
        done()
      } catch (e) {
        // 出错则不关闭dialog
        done(false)
      }
    },
    /**
     * 完整的删除方法，流程如下：
     * 1. 弹出二次确认弹窗（使用 deleteMessage）；
     * 2. 执行 onDelete，过程中确认按钮保持 loading；
     * 3. 失败则报错误信息、弹窗不关闭；
     * 4. 成功则报成功信息、弹窗关闭、重新请求数据、并校正页码（详见 correctPage）；
     * @public
     * @param {object|object[]} - 要删除的数据对象或数组
     */
    onDefaultDelete(data) {
      this.$confirm(this.deleteMessage(data), this.$t('common.Info'), {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        beforeClose: async(action, instance, done) => {
          if (action !== 'confirm') return done()

          instance.confirmButtonLoading = true

          try {
            await this.onDelete(data)
            done()
            this.onSuccess('delete', data)

            this.correctPage()
            this.getList()
          } catch (error) {
            console.warn(error.message)
            throw error
          } finally {
            instance.confirmButtonLoading = false
          }
        }
      }).catch(() => {
        /* 取消*/
      })
    },

    /**
     * 判断是否返回上一页
     * @public
     */
    correctPage() {
      let deleteCount = 1
      if (this.hasSelect) {
        deleteCount = this.selected.length
        this.clearSelection()
      }
      const remain = this.data.length - deleteCount
      const lastPage = Math.ceil(this.total / this.size)
      if (
        remain === 0 &&
        this.page === lastPage &&
        this.page > defaultFirstPage
      ) {
        this.page--
      }
    },

    // 树形table相关
    // https://github.com/PanJiaChen/vue-element-admin/tree/master/@/components/TreeTable
    tree2Array(data, expandAll, parent = null, level = null) {
      let tmp = []
      data.forEach(record => {
        if (record._expanded === undefined) {
          this.$set(record, '_expanded', expandAll)
        }
        let _level = 0
        if (level !== undefined && level !== null) {
          _level = level + 1
        }
        this.$set(record, '_level', _level)
        // 如果有父元素
        if (parent) {
          Object.defineProperty(record, 'parent', {
            value: parent,
            enumerable: false
          })
        }
        tmp.push(record)

        if (record[this.treeChildKey] && record[this.treeChildKey].length > 0) {
          const children = this.tree2Array(
            record[this.treeChildKey],
            expandAll,
            record,
            _level
          )
          tmp = tmp.concat(children)
        }
      })
      return tmp
    },
    rowClassName(...args) {
      let rcn =
        this.tableAttrs.rowClassName || this.tableAttrs['row-class-name'] || ''
      if (typeof rcn === 'function') rcn = rcn(...args)
      if (this.isTree) rcn += ' ' + this.showRow(...args)
      return rcn
    },
    showRow({ row }) {
      const show = !row.parent || (row.parent._expanded && row.parent._show)
      row._show = show
      return show ? 'row-show' : 'row-hide'
    },
    // 切换下级是否展开
    toggleExpanded(trIndex) {
      const record = this.data[trIndex]
      record._expanded = !record._expanded
    },
    // 图标显示
    iconShow(index, record) {
      //      return index ===0 && record.children && record.children.length > 0;
      return record[this.treeChildKey] && record[this.treeChildKey].length > 0
    },
    onSortChange({ column, prop, order }) {
      if (!order) {
        delete this.innerQuery['sort']
        delete this.innerQuery['direction']
      } else {
        this.innerQuery['sort'] = prop
        this.innerQuery['direction'] = order
      }
      this.getList()
    }
  }
}
</script>
<style lang="less" scoped>
// 自定义样式
@import url(index.less);

.el-data-table {
  @color-blue: #2196f3;
  @space-width: 18px;

  .ms-tree-space {
    position: relative;
    top: 1px;
    display: inline-block;
    font-style: normal;
    font-weight: 400;
    line-height: 1;
    width: @space-width;
    height: 14px;

    &::before {
      content: '';
    }
  }

  .tree-ctrl {
    position: relative;
    cursor: pointer;
    color: @color-blue;
  }

  @keyframes treeTableShow {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  .row-show {
    animation: treeTableShow 1s;
  }

  .row-hide {
    display: none;
  }
}
</style>
