<template>
  <Dialog
    v-bind="$attrs"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :show-buttons="false"
    :title="$tc('Strategy')"
    width="80%"
  >
    <IBox>
      <GenericCreateUpdateForm v-bind="$data" />
    </IBox>
  </Dialog>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import RuleInput from '@/views/assets/Cloud/Strategy/components/RuleInput.vue'
import ActionInput from '@/views/assets/Cloud/Strategy/components/ActionInput.vue'
import IBox from '@/components/Common/IBox/index.vue'

export default {
  name: 'AttrDialog',
  components: { Dialog, GenericCreateUpdateForm, IBox },
  props: {
    value: {
      type: Object,
      default: () => ({
        name: '',
        priority: 50,
        rule_relation: 'and',
        strategy_rules: [],
        strategy_actions: []
      })
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
        [this.$t('BasicSetting'), ['name', 'priority']],
        [this.$t('RuleSetting'), ['rule_relation', 'strategy_rules']],
        [this.$t('ActionSetting'), ['strategy_actions']]
      ],
      fieldsMeta: {
        rule_relation: {
          label: this.$t('RuleRelation'),
          helpTip: this.$t('RuleRelationHelpTip')
        },
        strategy_rules: {
          label: this.$t('Rule'),
          component: RuleInput
        },
        strategy_actions: {
          label: this.$t('Action'),
          component: ActionInput
        }
      },
      hasSaveContinue: false,
      onPerformSuccess: (instance) => {
        const index = this.tableConfig.totalData.findIndex((x) => x.id === instance.id)
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
          id: this.value.id,
          name: this.value.name,
          priority: this.value.priority,
          strategy_rules: this.value.strategy_rules,
          strategy_actions: this.value.strategy_actions,
          rule_relation: this.value.rule_relation
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
        this.$message.success(this.$tc('DeleteSuccessMsg'))
        this.object[type] = this.fieldsMeta[type].el.tableConfig.totalData
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form :deep(.el-form) {
  margin-top: -15px;
}

:deep(.el-form-item-rule_relation) {
  .el-form-item__label {
    min-height: 30px;
    display: inline-flex;
    align-items: center;
  }

  .el-form-item__content {
    min-height: 30px;
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .el-radio-group {
    display: inline-flex;
    align-items: center;
    gap: 16px;
    min-height: 30px;
  }

  .el-radio {
    margin: 0;
    height: 30px;
    display: inline-flex;
    align-items: center;
  }

  .el-radio__input,
  .el-radio__label {
    display: inline-flex;
    align-items: center;
    height: 30px;
  }
}

:deep(.el-form-item-rule_relation),
:deep(.el-form-item-strategy_rules),
:deep(.el-form-item-strategy_actions) {
  gap: 12px;

  .el-form-item__label-wrap {
    flex: 0 0 88px;
    width: 88px;
  }
}
</style>
