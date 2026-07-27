<template>
  <div class="variable-field">
    <div class="variables el-data-table">
      <el-table :data="variables" class="el-table--fit el-table--border">
        <el-table-column show-overflow-tooltip :label="$tc('Name')" prop="name" />
        <el-table-column show-overflow-tooltip :label="$tc('VariableName')" prop="var_name" />
        <el-table-column show-overflow-tooltip :label="$tc('DefaultValue')" prop="default_value" />
        <el-table-column
          v-if="!disableEdit"
          :label="$tc('Actions')"
          align="center"
          class-name="buttons"
          fixed="right"
          width="135"
        >
          <template #default="scope">
            <el-button icon="Minus" size="small" type="danger" @click="removeVariable(scope.row)" />
            <el-button
              :disabled="!!scope.row.template"
              icon="Edit"
              size="small"
              type="primary"
              @click="onEditClick(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!disableEdit" class="actions">
        <el-button size="small" type="primary" @click="onAddClick">
          {{ $t('Add') }}
        </el-button>
      </div>
      <AddVariableDialog
        v-model:visible="addVariableDialogVisible"
        :variable="variable"
        @add="addVariable"
        @edit="editVariable"
      />
    </div>
  </div>
</template>

<script>
import AddVariableDialog from './AddVariableDialog'

export default {
  name: 'Variable',
  components: {
    AddVariableDialog
  },
  props: {
    modelValue: {
      type: [Array],
      default: () => []
    },
    disableEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      variable: {},
      initial: false,
      addVariableDialogVisible: false
    }
  },
  computed: {
    variables: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
        this.$emit('change', val)
      }
    }
  },
  watch: {
    variables: {
      handler(newVal, oldVal) {
        if (oldVal === undefined) return
        if (newVal.length > 0 || !this.initial) {
          newVal.map((item) => {
            item.default_value = item.text_default_value || item.select_default_value || undefined
          })
          this.$emit('input', newVal)
        }
        if (newVal) {
          this.initial = true
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    normalizeVariable(variable) {
      return {
        ...variable,
        default_value: variable.text_default_value || variable.select_default_value || undefined
      }
    },
    addVariable(variable) {
      const nextVariable = this.normalizeVariable(variable)
      const variables = this.variables.filter(
        (item) => item.name !== nextVariable.name && item.var_name !== nextVariable.var_name
      )
      this.variables = [...variables, nextVariable]
    },
    editVariable(form) {
      const nextVariable = this.normalizeVariable(form)
      const currentVarName = this.variable?.var_name
      const variables = this.variables.slice()
      const index = variables.findIndex((item) => item.var_name === currentVarName)
      const duplicated = variables.some((item, itemIndex) => {
        if (itemIndex === index) return false
        return item.var_name === nextVariable.var_name || item.name === nextVariable.name
      })

      if (duplicated || index === -1) {
        return
      }

      variables.splice(index, 1, nextVariable)
      this.variables = variables
    },
    removeVariable(variable) {
      this.variables = this.variables.filter((item) => {
        if (variable.id && item.id) {
          return item.id !== variable.id
        } else if (variable.var_name && item.var_name) {
          return item.var_name !== variable.var_name
        } else {
          return variable.name !== item.name
        }
      })
    },
    onEditClick(variable) {
      this.variable = variable
      setTimeout(() => {
        this.addVariableDialogVisible = true
      })
    },
    onAddClick() {
      this.variable = null
      setTimeout(() => {
        this.addVariableDialogVisible = true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.variable-field,
.variables {
  width: 100%;
}

.el-data-table :deep(.el-table) {
  .table {
    margin-top: 15px;
  }

  .el-table__row {
    &.selected-row {
      background-color: #f5f7fa;
    }

    & > td {
      line-height: 1.5;
      padding: 6px 0;
      font-size: 13px;
      border-right: none;

      * {
        vertical-align: middle;
      }

      .el-checkbox {
        vertical-align: super;
      }

      & > div > span {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }

  .el-table__header > thead > tr > th {
    padding: 6px 0;
    background-color: #ffffff;
    font-size: 13px;
    line-height: 1.5;
    border-right: none;

    .cell {
      white-space: nowrap !important;
      overflow: hidden;
      text-overflow: ellipsis;

      &:hover {
        border-right: 2px solid #ebeef5;
      }
    }
  }
}

.el-data-table :deep(.el-table .el-table__header > thead > tr .is-sortable) {
  padding: 5px 0;

  .cell {
    padding-top: 3px !important;
  }
}
</style>
