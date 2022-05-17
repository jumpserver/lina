<template>
  <Dialog
    :title="this.$t('common.updateSelected')"
    :visible.sync="iVisible"
    width="70%"
    top="1vh"
    :show-cancel="false"
    :show-confirm="false"
  >
    <el-row :gutter="20">
      <el-col :md="4" :sm="24">
        <div class="select-prop-label">
          <label>{{ selectPropertiesLabel }}</label>
        </div>
      </el-col>
      <el-col :md="18" :sm="24">
        <el-checkbox-group v-model="checkedFields" @change="handleCheckedFieldsChange">
          <el-checkbox
            v-for="(value, name) in iFormSetting.fieldsMeta"
            :key="name"
            :checked="true"
            :label="name"
          >
            {{ value.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-col>
    </el-row>
    <el-row class="el-row-divider">
      <el-divider />
    </el-row>
    <el-row>
      <GenericCreateUpdateForm
        :key="internalKey"
        v-bind="iFormSetting"
      />
    </el-row>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { GenericCreateUpdateForm } from '@/layout/components'

export default {
  name: 'GenericUpdateFormDialog',
  components: {
    Dialog, GenericCreateUpdateForm
  },
  props: {
    selectedRows: {
      type: Array,
      default: () => ([])
    },
    formSetting: {
      type: Object,
      default: () => ({})
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      internalKey: 0,
      selectPropertiesLabel: this.$t('common.SelectProperties'),
      checkedFields: [],
      iFormSetting: {}
    }
  },
  computed: {
    iVisible: {
      set(val) {
        this.$emit('update:visible', val)
      },
      get() {
        return this.visible
      }
    }
  },
  mounted() {
    const defaultFormSetting = this.getDefaultFormSetting()
    this.iFormSetting = Object.assign({}, this.formSetting, defaultFormSetting)
  },
  methods: {
    handleCheckedFieldsChange(values) {
      for (const field of Object.keys(this.iFormSetting.fieldsMeta)) {
        if (values.indexOf(field) === -1) {
          this.iFormSetting.fieldsMeta[field].hidden = () => true
        } else {
          this.iFormSetting.fieldsMeta[field].hidden = () => false
        }
      }
      this.internalKey++
    },
    getDefaultFormSetting() {
      const vm = this
      return {
        submitMethod: () => 'patch',
        cleanFormValue: (value) => {
          const filterValue = {}
          Object.keys(value)
            .filter((key) => vm.checkedFields?.includes(key))
            .forEach((key) => { filterValue[key] = value[key] })
          const formValue = []
          let object = {}
          for (const row of vm.selectedRows) {
            object = Object.assign({}, filterValue, { id: row.id })
            formValue.push(object)
          }
          return formValue
        },
        onSubmit: function(validValues) {
          const url = this.url
          const msg = this.updateSuccessMsg
          this.$axios.patch(url, validValues).then((res) => {
            vm.$emit('update')
            this.$message.success(msg)
            this.iVisible = false
          }).catch(error => {
            this.$emit('submitError', error)
            const response = error.response
            const data = response.data
            if (response.status === 400) {
              for (const key of Object.keys(data)) {
                let value = data[key]
                if (value instanceof Array) {
                  value = value.join(';')
                }
                this.$refs.form.setFieldError(key, value)
              }
            }
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-row-divider{
    margin-bottom: 20px;
  }
  .select-prop-label{
    float: right;
    padding-right: 30px;
  }

</style>
