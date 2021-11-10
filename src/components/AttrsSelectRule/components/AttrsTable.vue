<template>
  <div>
    <i class="el-icon-circle-plus add" @click="dialogFormVisible = true" />
    <el-table
      :data="tableData"
      style="width: 100%"
    >
      <div v-for="item in attrs" :key="item.prop">
        <el-table-column
          v-if="item.isShowTable"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
        />
      </div>
      <el-table-column :label="this.$t('common.Actions')">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, tableData)"
          >
            {{ $t('common.Delete') }}
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <!-- 新增弹框 -->
    <Dialog
      :title="this.$t('common.AttributeRule')"
      top="2vh"
      width="640px"
      :show-cancel="false"
      :visible.sync="dialogFormVisible"
      @confirm="handleConfirm"
    >
      <el-form ref="ruleForm" :model="form" :rules="rules" :label-width="formLabelWidth">
        <el-form-item
          v-for="(item, index) in attrs"
          :key="index"
          :label="item.label"
          label-position="left"
          :prop="item.prop"
        >
          <el-select v-if="item.type === 'select'" v-model="form[item.prop]">
            <el-option
              v-for="(i) in item.option"
              :key="i.value"
              :label="i.label"
              :value="i.value"
            />
          </el-select>
          <el-switch v-if="item.type ==='switch'" v-model="form.delivery" />
          <el-input v-if="item.type ==='input'" v-model.trim="form.value" />
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
      type: Object,
      default: () => {}
    },
    attrs: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tableData: this.value.rules,
      dialogFormVisible: false,
      form: {
        attr: '',
        operator: '',
        value: ''
      },
      formLabelWidth: '120px',
      rules: {
        attr: [RequiredChange],
        operator: [RequiredChange],
        value: [RequiredChange]
      }
    }
  },
  methods: {
    handleConfirm() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          const curForm = _.cloneDeep(this.form)
          this.tableData.push(curForm)
          this.$emit('handleValue', this.tableData)
          this.dialogFormVisible = false
          this.$nextTick(() => {
            this.$refs['ruleForm'].resetFields()
          })
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
