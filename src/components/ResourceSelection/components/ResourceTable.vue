<template>
  <div>
    <ResourceFormDialog
      :new-attrs="createFormAttrs"
      :dialog-form-visible.sync="dialogFormVisible"
      @addItem="handleForm"
    />
    <el-table
      :data="tableDatas"
      style="width: 100%"
    >
      <div v-for="(val, key) in createFormAttrs" :key="key">
        <el-table-column
          :key="key"
          :prop="key"
          :label="val.label"
        />
      </div>
      <el-table-column :label="this.$t('common.Actions')">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, tableDatas)"
          >
            {{ $t('common.Delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import ResourceFormDialog from './ResourceFormDialog'
export default {
  components: { ResourceFormDialog },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    attrsOption: {
      type: Object,
      default: () => {}
    },
    newAttrs: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      tableDatas: this.value || [],
      dialogFormVisible: false
    }
  },
  computed: {
    createFormAttrs() {
      return Object.assign((this.newAttrs.children.rules.child.children || {}), this.attrsOption)
    }
  },
  methods: {
    handleForm(item) {
      this.tableDatas.push(item)
    },
    handleDelete(index, rows) {
      rows.splice(index, 1)
      this.$emit('handleValue', rows)
    }
  }
}
</script>

<style scoped>
</style>
