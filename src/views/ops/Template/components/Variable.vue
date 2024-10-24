<template>
  <div>
    <div class="variables el-data-table">
      <el-table :data="variables" class="el-table--fit el-table--border">
        <el-table-column :label="$tc('VariableName')" prop="name" />
        <el-table-column :label="$tc('VariableUsername')" prop="username" />
        <el-table-column :label="$tc('Actions')" align="center" class-name="buttons" fixed="right" width="135">
          <template v-slot="scope">
            <el-button icon="el-icon-minus" size="mini" type="danger" @click="removeAccount(scope.row)" />
            <el-button
              :disabled="!!scope.row.template"
              icon="el-icon-edit"
              size="mini"
              type="primary"
              @click="onEditClick(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
      <div class="actions">
        <el-button size="mini" type="primary" @click="onAddClick">
          {{ $t('Add') }}
        </el-button>
      </div>
      <AddVariableDialog
        :variable="variable"
        :variables="variables"
        :visible.sync="addVariableDialogVisible"
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
    platform: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: [Array],
      default: () => []
    },
    isUpdate: {
      type: Function,
      default: (vm) => {
        return vm.$route.params.id
      }
    }
  },
  data() {
    const variables = this.value || []
    return {
      variables: variables,
      variable: {},
      initial: false,
      addVariableDialogVisible: false
    }
  },
  watch: {
    variables: {
      handler(value) {
        if (value.length > 0 || this.initial) {
          this.$emit('input', value)
        }
        if (value) {
          this.initial = true
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    removeAccount(variable) {
      this.variables = this.variables.filter((item) => {
        if (variable.id && item.id) {
          return item.id !== variable.id
        } else if (variable.username && item.username) {
          return item.username !== variable.username
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
.el-data-table ::v-deep .el-table {
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
        border-right: 2px solid #EBEEF5;
      }
    }
  }
}

.el-data-table ::v-deep .el-table .el-table__header > thead > tr .is-sortable {
  padding: 5px 0;

  .cell {
    padding-top: 3px !important;
  }
}
</style>
