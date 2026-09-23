<template>
  <div class="condition-editor">
    <span class="condition-caption">{{ $t('WFConditionMode') }}</span>
    <el-select :model-value="kind" :disabled="disabled" @change="changeKind">
      <el-option
        v-for="key in ['rule', 'and', 'or', 'not']"
        :key="key"
        :value="key"
        :label="$t(`WFCondition_${key}`)"
      />
    </el-select>
    <template v-if="kind === 'rule'">
      <span class="condition-caption">{{ $t('WFField') }}</span>
      <el-select
        v-model="modelValue.field"
        filterable
        allow-create
        default-first-option
        :disabled="disabled"
        :placeholder="$t('WFField')"
      >
        <el-option v-for="field in fields" :key="field" :value="field" :label="field" />
      </el-select>
      <span class="condition-caption">{{ $t('WFOperator') }}</span>
      <el-select v-model="modelValue.operator" :disabled="disabled" @change="changeOperator">
        <el-option v-for="op in operators" :key="op" :value="op" :label="$t(`WFOp_${op}`)" />
      </el-select>
      <span class="condition-caption">{{ $t('WFValue') }}</span>
      <el-switch
        v-if="modelValue.operator === 'exists'"
        v-model="modelValue.value"
        :disabled="disabled"
      />
      <template v-else>
        <el-select
          v-if="!['in', 'not_in', 'gt', 'gte', 'lt', 'lte'].includes(modelValue.operator)"
          :model-value="valueType"
          :disabled="disabled"
          @change="changeValueType"
        >
          <el-option
            v-for="t in ['string', 'number', 'boolean']"
            :key="t"
            :value="t"
            :label="$t(`WFValue_${t}`)"
          />
        </el-select>
        <el-input-number
          v-if="typeof modelValue.value === 'number'"
          v-model="modelValue.value"
          :disabled="disabled"
        />
        <el-switch
          v-else-if="typeof modelValue.value === 'boolean'"
          v-model="modelValue.value"
          :disabled="disabled"
        />
        <el-select
          v-else-if="Array.isArray(modelValue.value)"
          v-model="modelValue.value"
          multiple
          filterable
          allow-create
          default-first-option
          :disabled="disabled"
          :placeholder="$t('WFValues')"
        />
        <el-input
          v-else
          v-model="modelValue.value"
          :disabled="disabled"
          :placeholder="$t('WFValue')"
        />
      </template>
      <span class="condition-caption">{{ $t('WFQuantifier') }}</span>
      <el-select
        v-model="modelValue.quantifier"
        clearable
        :disabled="disabled"
        :placeholder="$t('WFQuantifier')"
        @clear="delete modelValue.quantifier"
      >
        <el-option value="any" :label="$t('WFAnyValue')" /><el-option
          value="all"
          :label="$t('WFAllValues')"
        />
      </el-select>
    </template>
    <template v-else>
      <div v-for="(child, index) in children" :key="index" class="condition-child">
        <ConditionEditor
          :model-value="child"
          :disabled="disabled"
          :depth="depth + 1"
          @update:model-value="replaceChild(index, $event)"
        />
        <el-button
          v-if="kind !== 'not' && children.length > 1 && !disabled"
          link
          type="danger"
          @click="children.splice(index, 1)"
          >{{ $t('Delete') }}</el-button
        >
      </div>
      <el-button
        v-if="kind !== 'not' && !disabled && depth < 8 && children.length < 32"
        @click="children.push(newCondition())"
        >{{ $t('WFAddRule') }}</el-button
      >
    </template>
  </div>
</template>
<script>
import { newCondition } from './graph'
export default {
  name: 'ConditionEditor',
  props: {
    modelValue: { type: Object, required: true },
    disabled: Boolean,
    depth: { type: Number, default: 0 }
  },
  emits: ['update:modelValue'],
  data: () => ({
    operators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains', 'exists'],
    fields: [
      'asset.labels.env',
      'asset.platform.type',
      'asset.platform.category',
      'asset.owner.id',
      'account.username',
      'duration',
      'request.command',
      'request.ip',
      'applicant.username',
      'actions'
    ]
  }),
  computed: {
    kind() {
      return ['and', 'or', 'not'].find((k) => k in this.modelValue) || 'rule'
    },
    children() {
      return this.kind === 'not' ? [this.modelValue.not] : this.modelValue[this.kind]
    },
    valueType() {
      return typeof this.modelValue.value
    }
  },
  methods: {
    newCondition,
    changeKind(kind) {
      if (kind !== 'rule' && this.depth >= 8) return
      this.$emit(
        'update:modelValue',
        kind === 'rule'
          ? newCondition()
          : { [kind]: kind === 'not' ? newCondition() : [newCondition()] }
      )
    },
    replaceChild(index, value) {
      if (this.kind === 'not') this.modelValue.not = value
      else this.children[index] = value
    },
    changeValueType(type) {
      this.modelValue.value = type === 'number' ? 0 : type === 'boolean' ? true : ''
    },
    changeOperator(op) {
      this.modelValue.value =
        op === 'exists'
          ? true
          : ['in', 'not_in'].includes(op)
            ? []
            : ['gt', 'gte', 'lt', 'lte'].includes(op)
              ? 0
              : ''
    }
  }
}
</script>
<style scoped>
.condition-editor {
  display: grid;
  gap: 8px;
  width: 100%;
}
.condition-caption {
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 18px;
  margin-top: 6px;
}
.condition-caption:first-child {
  margin-top: 0;
}
.condition-child {
  border-left: 2px solid var(--el-border-color);
  padding-left: 12px;
}
</style>
