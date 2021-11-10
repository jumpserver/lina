<template>
  <div>
    <i class="el-icon-circle-plus add" @click="dialogFormVisible = true" />
    <el-table
      :data="tableData"
      style="width: 100%"
    >
      <el-table-column
        v-for="item in columns"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
        :formatter="item.formatter"
        :width="item.width"
      />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, tableData)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增弹框 -->
    <Dialog
      title="配置属性"
      top="2vh"
      width="640px"
      :show-cancel="false"
      :visible.sync="dialogFormVisible"
      @close="handleDialogClose"
      @confirm="handleConfirm"
    >
      <el-form ref="ruleForm" :model="form" :rules="rules" :label-width="formLabelWidth">
        <el-form-item label="属性" label-position="left" prop="attrs">
          <el-select v-model="form.attrs">
            <el-option
              v-for="item in attrs"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="匹配" label-position="left" prop="operator">
          <el-select v-model="form.operator">
            <el-option
              v-for="item in operator"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="忽略大小写" label-position="left" prop="delivery">
          <el-switch v-model="form.delivery" />
        </el-form-item>
        <el-form-item label="内容" label-position="left" prop="content">
          <el-input v-model.trim="form.content" />
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import { RequiredChange } from '@/components/DataForm/rules'

export default {
  components: { Dialog },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    attrs: {
      type: Array,
      default: () => [{
        label: '资产名',
        value: 'zichanming'
      }, {
        label: 'IP',
        value: 'IP'
      }, {
        label: '简要说明',
        value: 'shuoming'
      }, {
        label: '责任人',
        value: 'zerenren'
      }, {
        label: '资产组',
        value: 'zichanzu'
      }, {
        label: '资产属性',
        value: 'zichanshuxing'
      }, {
        label: '资产类型',
        value: 'zichanleixing'
      }]
    },
    operator: {
      type: Array,
      default: () => [{
        label: '=',
        value: '='
      }, {
        label: '!=',
        value: '!='
      }, {
        label: '>',
        value: '>'
      }, {
        label: '<',
        value: '<'
      }, {
        label: '>=',
        value: '>='
      }, {
        label: '<=',
        value: '<='
      }, {
        label: '包含',
        value: 'baohan'
      }, {
        label: '不包含',
        value: 'bubaohan'
      }, {
        label: '正则',
        value: 'zhengze'
      }]
    }
  },
  data() {
    const columns = [
      {
        label: '属性',
        prop: 'attrs'
      },
      {
        label: '操作符',
        prop: 'operator'
      },
      {
        label: '内容',
        prop: 'content'
      }
    ]
    return {
      columns,
      tableData: this.value,
      dialogFormVisible: false,
      form: {
        attrs: '',
        operator: '',
        delivery: false,
        content: ''
      },
      formLabelWidth: '120px',
      rules: {
        attrs: [RequiredChange],
        operator: [RequiredChange],
        delivery: [RequiredChange],
        content: [RequiredChange]
      }
    }
  },
  methods: {
    handleConfirm(type) {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          const form = this.form
          this.tableData.push(form)
          this.$emit('handleValue', this.tableData)
          this.dialogFormVisible = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    handleEdit(index, row) {
      this.dialogFormVisible = true
      this.form = Object.assign({}, row)
    },
    handleDelete(index, rows) {
      rows.splice(index, 1)
      this.$emit('handleValue', rows)
    },
    handleDialogClose() {
      // this.$refs.ruleForm.resetFields()
    }
  }
}
</script>

<style scoped>
  .add {
    font-size: 22px;
    cursor:pointer;
  }
</style>
