<template>
  <div>
    <el-radio-group v-model="iValue.type">
      <el-radio v-for="tp of types" :key="tp.name" :label="tp.name">
        {{ tp.label }}
      </el-radio>
    </el-radio-group>
    <Select2 v-if="iValue.type === 'ids'" v-model="ids" v-bind="select2" />
    <div>
      <DataTable v-model="iAttrs" :config="tableConfig" class="attr-list" />
      <div class="actions">
        <el-button size="mini" type="primary">
          {{ $t('common.Add') }}
        </el-button>
        <el-button size="mini" type="success">
          {{ $t('common.TemplateAdd') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Select2 from './Select2.vue'
import DataTable from '@/components/DataTable/index.vue'

export default {
  name: 'JSONManyToManySelect',
  components: { DataTable, Select2 },
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
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      iValue: Object.assign({ type: 'all' }, this.value),
      ids: [],
      iAttrs: [],
      types: [
        { name: 'all', label: '全部' },
        { name: 'ids', label: '指定' },
        { name: 'attrs', label: '属性选择' }
      ],
      tableConfig: {
        columns: [
          { prop: 'name', label: '属性名' },
          { prop: 'match', label: '匹配' },
          { prop: 'value', label: '属性值' }
        ],
        hasPagination: false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.attr-list {
  width: 80%;
}
</style>
