<template>
  <div>
    <i class="el-icon-circle-plus add" @click="dialogVisible = true" />

    <Dialog
      :title="this.$t('common.AttributeRule')"
      top="2vh"
      width="640px"
      :show-cancel="false"
      v-bind="$attrs"
      :visible.sync="dialogVisible"
      @confirm="handleConfirm"
    >
      <el-form
        ref="ruleForm"
        :model="form"
        :rules="rules"
        :label-width="formLabelWidth"
      >
        <el-form-item
          v-for="(val, key) in newAttrs"
          :key="key"
          :label="val.label"
          label-position="left"
          :prop="key"
        >
          <el-select v-if="val.type === 'nested object'" v-model="form[key]">
            <el-option
              v-for="(i) in val.choices"
              :key="i.value"
              :label="i.display_name"
              :value="i.value"
            />
          </el-select>
          <el-radio-group v-if="val.type === 'choice'" v-model="form[key]">
            <el-radio
              v-for="(i) in val.choices"
              :key="i.value"
              :label="i.display_name"
            >
              {{ i.value }}
            </el-radio>
          </el-radio-group>
          <el-switch v-if="val.type ==='switch'" v-model="form[key]" />
          <el-input v-if="val.type ==='list'" v-model.trim="form[key]" />
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
    attrs: {
      type: Array,
      default: () => []
    },
    dialogFormVisible: {
      type: Boolean,
      default: false
    },
    newAttrs: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      form: {},
      dialogVisible: false,
      formLabelWidth: '90px',
      rules: {
        attr: [RequiredChange],
        operator: [RequiredChange],
        value: [RequiredChange]
      }
    }
  },
  computed: {
  },
  create() {
    this.initForm()
  },
  methods: {
    initForm() {
      Object.keys(this.newAttrs).forEach(i => {
        this.form[i] = ''
      })
    },
    handleConfirm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          const currentForm = _.cloneDeep(this.form)
          this.$emit('addItem', currentForm)
          this.dialogVisible = false
          this.$nextTick(() => {
            this.$refs['ruleForm'].resetFields()
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
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
