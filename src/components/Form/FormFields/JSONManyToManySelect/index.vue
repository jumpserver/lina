<template>
  <div class="json-m2m-select">
    <el-radio-group v-model="iValue.type" @change="handleTypeChange">
      <el-radio v-for="tp of types" :key="tp.name" :value="tp.name">
        {{ tp.label }}
      </el-radio>
    </el-radio-group>
    <ResourceSelect
      v-bind="select2"
      v-if="iValue.type === 'ids'"
      v-model="ids"
      :resource-name="resource"
      summary-count-only
      @change="onChangeEmit"
    />
    <div v-if="iValue.type === 'attrs'">
      <DataTable ref="attrTable" :config="tableConfig" class="attr-list" />
      <div class="actions">
        <el-button size="small" type="primary" @click="handleAttrAdd">
          {{ $t('Add') }}
        </el-button>
        <span style="padding-left: 10px; font-size: 13px">
          <span class="help-tips;">{{ $t('MatchedCount') }}:</span>
          <a class="text-link" style="padding: 0 5px" @click="showAttrMatchTable">{{
            attrMatchCount
          }}</a>
        </span>
      </div>
    </div>

    <AttrFormDialog
      v-if="attrFormVisible"
      v-model:visible="attrFormVisible"
      :attrs="attrs"
      :attrs-added="attrsAdded"
      :form="attrForm"
      @confirm="handleAttrDialogConfirm"
    />
    <AttrMatchResultDialog
      v-if="attrMatchTableVisible"
      v-model:visible="attrMatchTableVisible"
      :attrs="attrs"
      :url="attrMatchTableUrl"
    />
  </div>
</template>

<script>
import { attrMatchOptions } from '@/components/const'
import DataTable from '@/components/Table/DataTable/index.vue'
import { setUrlParam } from '@/utils/common/index'
import { toM2MJsonParams } from '@/utils/jms/index'
import { h, resolveComponent } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import ResourceSelect from '../ResourceSelect/index.vue'
import AttrFormDialog from './AttrFormDialog.vue'
import AttrMatchResultDialog from './AttrMatchResultDialog.vue'
import ValueFormatter from './ValueFormatter.vue'

const AttrActionFormatter = {
  name: 'AttrActionFormatter',
  props: {
    row: {
      type: Object,
      default: () => ({})
    },
    col: {
      type: Object,
      default: () => ({})
    },
    cellValue: {
      type: [String, Number, Boolean, Object, Array],
      default: null
    },
    index: {
      type: Number,
      default: 0
    }
  },
  methods: {
    trigger(handlerName) {
      const handler = this.col?.formatterArgs?.[handlerName]
      if (typeof handler !== 'function') {
        return
      }
      const next = handler({
        row: this.row,
        col: this.col,
        cellValue: this.cellValue,
        index: this.index
      })
      if (typeof next === 'function') {
        next()
      }
    }
  },
  render() {
    const ElButton = resolveComponent('el-button')
    return h('div', { class: 'input-button' }, [
      h(ElButton, {
        icon: 'Edit',
        size: 'small',
        style: { flexShrink: 0 },
        type: 'primary',
        onClick: () => this.trigger('onEdit')
      }),
      h(ElButton, {
        icon: 'Minus',
        size: 'small',
        style: { flexShrink: 0 },
        type: 'danger',
        onClick: () => this.trigger('onDelete')
      })
    ])
  }
}

export default {
  name: 'JSONManyToManySelect',
  components: {
    AttrActionFormatter,
    AttrFormDialog,
    AttrMatchResultDialog,
    DataTable,
    ResourceSelect
  },
  // 根节点是 <div>。父级(DataForm)通过 v-on 绑定了 input/change/update:modelValue 等
  // 监听器，Vue3 默认会把这些透传成根 <div> 的原生 DOM 监听器；内部 el-radio-group 的
  // 原生 radio input/change 事件冒泡上来会带上 target.value(如 "all"/"attrs")，污染表单
  // 值，导致 value prop 收到 String 而非 Object 报错。
  // inheritAttrs:false 让这些监听器只留在 $attrs、不绑到根节点，组件只通过显式
  // $emit('input', object) 更新表单值，彻底杜绝原生事件冒泡污染。
  inheritAttrs: false,
  emits: ['input'],
  props: {
    value: {
      type: Object,
      default: () => {
        return {
          type: 'all'
        }
      }
    },
    select2: {
      type: Object,
      required: true
    },
    attrs: {
      type: Array,
      default: () => []
    },
    resource: {
      type: String,
      default: ''
    },
    attrTableColumns: {
      type: Array,
      default: () => ['name']
    }
  },
  data() {
    const initialValue = cloneDeep(this.value || { type: 'all' })
    const tableFormatter = (colName) => {
      return (row, col, cellValue) => {
        const value = cellValue
        switch (colName) {
          case 'name':
            return this.attrs.find((attr) => attr.name === value)?.label || value
          case 'match':
            return attrMatchOptions.find((opt) => opt.value === value).label || value
          case 'value':
            return Array.isArray(value) ? value.join(', ') : value
          default:
            return value
        }
      }
    }
    return {
      iValue: Object.assign({ type: 'all' }, initialValue),
      attrFormVisible: false,
      attrForm: {},
      attrMatchCount: 0,
      attrMatchTableVisible: false,
      attrMatchTableUrl: '',
      ids: Array.isArray(initialValue.ids) ? initialValue.ids : [],
      editIndex: -1,
      types: [
        { name: 'all', label: this.$t('All') + this.$t('WordSep') + this.resource.toLowerCase() },
        { name: 'ids', label: this.$t('Spec') + this.$t('WordSep') + this.resource.toLowerCase() },
        { name: 'attrs', label: this.$t('SelectByAttr') }
      ],
      tableConfig: {
        columns: [
          { prop: 'name', label: this.$t('AttrName'), formatter: tableFormatter('name') },
          { prop: 'match', label: this.$t('Match'), formatter: tableFormatter('match') },
          {
            prop: 'value',
            label: this.$t('AttrValue'),
            formatter: ValueFormatter,
            formatterArgs: { attrs: this.attrs }
          },
          {
            prop: 'action',
            label: this.$t('Action'),
            align: 'center',
            width: '120px',
            formatter: AttrActionFormatter,
            formatterArgs: {
              onEdit: this.handleAttrEdit,
              onDelete: this.handleAttrDelete
            }
          }
        ],
        totalData: Array.isArray(initialValue.attrs) ? initialValue.attrs : [],
        hasPagination: false
      }
    }
  },
  computed: {
    attrsAdded() {
      return this.tableConfig.totalData.map((item) => item.name)
    }
  },
  watch: {
    value: {
      deep: true,
      handler(value) {
        if (!isEqual(value, this.getCurrentValue())) {
          this.syncExternalValue(value)
        }
      }
    },
    attrFormVisible(val) {
      if (!val) {
        this.getAttrsCount()
      }
    }
  },
  mounted() {
    if (this.value.type === 'attrs') {
      this.getAttrsCount()
    }
    this.$emit('input', this.iValue)
  },
  methods: {
    getCurrentValue() {
      if (this.iValue.type === 'ids') {
        return { type: 'ids', ids: this.ids }
      }
      if (this.iValue.type === 'attrs') {
        return { type: 'attrs', attrs: this.tableConfig.totalData }
      }
      return { type: 'all' }
    },
    syncExternalValue(value) {
      const nextValue = cloneDeep(value || { type: 'all' })
      this.iValue = Object.assign({ type: 'all' }, nextValue)
      this.ids = Array.isArray(nextValue.ids) ? nextValue.ids : []
      this.tableConfig.totalData = Array.isArray(nextValue.attrs) ? nextValue.attrs : []
      if (nextValue.type === 'attrs') {
        this.$nextTick(() => {
          this.$refs.attrTable?.getList()
          this.getAttrsCount()
        })
      } else {
        this.attrMatchCount = 0
      }
    },
    showAttrMatchTable() {
      const [key, value] = this.getAttrFilterKey()
      this.attrMatchTableUrl = setUrlParam(this.select2.url, key, value)
      this.attrMatchTableVisible = true
    },
    getAttrFilterKey() {
      if (this.tableConfig.totalData.length === 0) return ''
      let attrFilter = { type: 'attrs', attrs: this.tableConfig.totalData }
      attrFilter = toM2MJsonParams(attrFilter)
      return attrFilter
    },
    getAttrsCount() {
      const attrFilter = this.getAttrFilterKey()
      if (!attrFilter) {
        this.attrMatchCount = 0
        return
      }
      const [key, value] = attrFilter
      let url = setUrlParam(this.select2.url, key, value)
      url = setUrlParam(url, 'limit', 1)
      return this.$axios.get(url).then((res) => {
        this.attrMatchCount = res.count
      })
    },
    handleAttrEdit({ row, index }) {
      return () => {
        this.attrForm = Object.assign({ index }, row)
        this.editIndex = index
        this.attrFormVisible = true
      }
    },
    handleAttrDelete({ index }) {
      return () => {
        this.tableConfig.totalData.splice(index, 1)
        this.getAttrsCount()
        this.onChangeEmit()
      }
    },
    handleAttrAdd() {
      this.attrForm = {}
      this.editIndex = -1
      this.attrFormVisible = true
    },
    onChangeEmit() {
      const tp = this.iValue.type
      this.handleTypeChange(tp)
    },
    handleTypeChange(val) {
      switch (val) {
        case 'ids':
          this.$emit('input', { type: 'ids', ids: this.ids })
          break
        case 'attrs':
          this.$emit('input', { type: 'attrs', attrs: this.tableConfig.totalData })
          break
        default:
          this.$emit('input', { type: 'all' })
          break
      }
    },
    handleAttrDialogConfirm(form) {
      if (this.editIndex > -1) {
        this.tableConfig.totalData.splice(this.editIndex, 1)
      }
      const allAttrs = this.tableConfig.totalData
      // 因为可能 attr 的 name 会重复，所以需要先删除再添加
      const setIndex = allAttrs.findIndex((attr) => attr.name === form.name)
      if (setIndex === -1) {
        allAttrs.push(Object.assign({}, form))
      } else {
        allAttrs.splice(setIndex, 1, Object.assign({}, form))
      }
      this.attrFormVisible = false
      this.onChangeEmit()
    }
  }
}
</script>

<style lang="scss" scoped>
// 根节点必须撑满：外层 .el-form-item__content 是 flex column + align-items:flex-start，
// 不会自动拉伸块级子元素，否则本组件(radio + 属性表格)会按内容宽度收缩、不占满表单项宽度。
.json-m2m-select {
  width: 100%;
}

.attr-list {
  width: 99%;
}
</style>
