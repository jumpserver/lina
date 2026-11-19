<template>
  <div class="ticket-condition">
    <template v-if="kind === 'rule'">
      <span>{{ ruleText }}</span>
      <span v-if="showQuantifier">
        · {{ $t(quantifier === 'all' ? 'WFAllValues' : 'WFAnyValue') }}</span
      >
    </template>
    <template v-else-if="kind">
      <span>{{ $t(`WFCondition_${kind}`) }}</span>
      <ul>
        <li v-for="(child, index) in children" :key="index">
          <TicketCondition
            :condition="child"
            :items="items"
            :snapshot="snapshot"
            :depth="depth + 1"
          />
        </li>
      </ul>
    </template>
    <pre v-else>{{ condition ? JSON.stringify(condition, null, 2) : '-' }}</pre>
  </div>
</template>

<script>
import { conditionFieldLabels } from '../Workflow/graph'

const requestFields = {
  'request.duration': 'WFFieldValidity',
  'request.direction': 'WFFieldDirection',
  'request.paths': 'WFFieldPaths',
  'request.session': 'SessionID',
  'request.target_directory': 'TicketTransferTargetDirectory'
}

export default {
  name: 'TicketCondition',
  props: {
    condition: { type: Object, default: null },
    items: { type: Array, default: () => [] },
    snapshot: { type: Object, default: () => ({}) },
    depth: { type: Number, default: 0 }
  },
  computed: {
    kind() {
      const rule = this.condition
      if (!rule || this.depth > 8) return ''
      const keys = Object.keys(rule)
      if (keys.length === 1) {
        if (
          ['and', 'or'].includes(keys[0]) &&
          Array.isArray(rule[keys[0]]) &&
          rule[keys[0]].length
        ) {
          return keys[0]
        }
        if (
          keys[0] === 'not' &&
          rule.not &&
          typeof rule.not === 'object' &&
          !Array.isArray(rule.not)
        ) {
          return 'not'
        }
      }
      if (
        typeof rule.field === 'string' &&
        ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains', 'exists'].includes(
          rule.operator
        ) &&
        Object.hasOwn(rule, 'value') &&
        (rule.operator !== 'exists' || typeof rule.value === 'boolean') &&
        (!Object.hasOwn(rule, 'quantifier') || ['any', 'all'].includes(rule.quantifier)) &&
        keys.every((key) => ['field', 'operator', 'value', 'quantifier'].includes(key))
      ) {
        return 'rule'
      }
      return ''
    },
    children() {
      return this.kind === 'not' ? [this.condition.not] : this.condition[this.kind]
    },
    fieldLabel() {
      const field = this.condition.field
      const alias = field.replace(/^assets\./, 'asset.').replace(/^accounts\./, 'account.')
      if (Object.hasOwn(conditionFieldLabels, alias)) return this.$t(conditionFieldLabels[alias])
      if (Object.hasOwn(requestFields, field)) return this.$t(requestFields[field])
      return (
        (field.startsWith('request.') &&
          this.items.find((item) => `request.${item.name}` === field)?.label) ||
        field
      )
    },
    operatorLabel() {
      return this.$t(
        this.condition.operator === 'exists' && !this.condition.value
          ? 'WFOp_not_exists'
          : `WFOp_${this.condition.operator}`
      )
    },
    ruleText() {
      const value =
        this.condition.operator === 'exists' ? '' : ` ${this.formatValue(this.condition.value)}`
      return `${this.fieldLabel} ${this.operatorLabel}${value}`
    },
    quantifier() {
      // Match the stored rule's default; this only describes the rule, never re-evaluates it.
      return (
        this.condition.quantifier ||
        (['ne', 'not_in'].includes(this.condition.operator) ? 'all' : 'any')
      )
    },
    showQuantifier() {
      if (this.condition.quantifier || /^(assets?|accounts?|nodes)\./.test(this.condition.field)) {
        return true
      }
      let value = this.snapshot
      for (const part of this.condition.field.split('.')) {
        if (Array.isArray(value)) return true
        value = value?.[part]
      }
      return false
    }
  },
  methods: {
    formatValue(value) {
      if (Array.isArray(value)) return `[${value.map((item) => this.formatValue(item)).join(', ')}]`
      if (typeof value === 'boolean') return this.$t(value ? 'Yes' : 'No')
      if (typeof value !== 'string') return JSON.stringify(value)
      if (this.condition.field === 'request.direction' && ['upload', 'download'].includes(value)) {
        return this.$t(value === 'upload' ? 'Upload' : 'Download')
      }
      // Quotes distinguish literal text from numbers, booleans, empty values and list separators.
      return !value.trim() ||
        /^(true|false|null|[+-]?\d+(\.\d+)?)$/.test(value) ||
        /[,\[\]\n]/.test(value)
        ? JSON.stringify(value)
        : value
    }
  }
}
</script>

<style scoped>
.ticket-condition {
  margin-top: 4px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
ul {
  margin: 2px 0 0;
  padding-left: 20px;
}
pre {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
