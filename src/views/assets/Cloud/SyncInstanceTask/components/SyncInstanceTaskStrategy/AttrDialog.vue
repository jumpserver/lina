<template>
  <Dialog
    :destroy-on-close="true"
    :show-buttons="false"
    :close-on-click-modal="false"
    :title="$tc('common.Strategy')"
    width="80%"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <GenericCreateUpdateForm v-bind="$data" />
  </Dialog>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import Dialog from '@/components/Dialog/index.vue'
import RuleInput from '@/views/assets/Cloud/Strategy/components/RuleInput'
import ActionInput from '@/views/assets/Cloud/Strategy/components/ActionInput'

export default {
  name: 'AttrDialog',
  components: { Dialog, GenericCreateUpdateForm },
  props: {
    value: {
      type: Object,
      default: () => ({ name: '', task_rules: [], task_actions: [] })
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      object: this.getObject(),
      fields: [
        [this.$t('common.BasicSetting'), ['name']],
        [this.$t('common.RuleSetting'), ['task_rules']],
        [this.$t('common.ActionSetting'), ['task_actions']]
      ],
      fieldsMeta: {
        task_rules: {
          label: this.$t('common.Rule'),
          component: RuleInput
        },
        task_actions: {
          label: this.$t('common.Action'),
          component: ActionInput
        }
      },
      hasSaveContinue: false,
      onPerformSuccess: (instance) => {
        const index = this.tableConfig.totalData.findIndex(x => x.id === instance.id)
        if (index !== -1) {
          this.tableConfig.totalData.splice(index, 1, instance)
        } else {
          this.tableConfig.totalData.push(instance)
        }
        this.$emit('confirm')
        this.$emit('update:visible', false)
      },
      getUrl: () => {
        const url = '/api/v1/xpack/cloud/strategies/'
        return this.object?.id ? `${url}${this.object.id}/` : url
      },
      submitMethod: () => {
        return this.object?.id ? 'put' : 'post'
      }
    }
  },
  methods: {
    getObject() {
      if (this.value?.id) {
        return {
          id: this.value.id, name: this.value.name,
          task_rules: this.value.task_rules, task_actions: this.value.task_actions
        }
      }
      return {}
    },
    handleAttrDelete(type, index) {
      return () => {
        const item = this.fieldsMeta[type].el.tableConfig.totalData.splice(index, 1)
        if (item[0]?.id) {
          this.$axios.delete(`/api/v1/xpack/cloud/${type}/${item[0]?.id}/`)
        }
        this.$message.success(this.$tc('common.deleteSuccessMsg'))
        this.object[type] = this.fieldsMeta[type].el.tableConfig.totalData
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form ::v-deep .el-form {
  margin-top: -15px;
}
</style>

