<template>
  <span :class="['display-formatter', cls, { 'is-boolean': isBooleanValue }]">
    <template v-if="isBooleanValue">
      <i :class="['fa', booleanValue ? 'fa-check-circle' : 'fa-times-circle', 'boolean-icon']" />
      <span>{{ booleanText }}</span>
    </template>
    <template v-else>
      {{ value }}
    </template>
  </span>
</template>

<script>
import BaseFormatter from './base.vue'
export default {
  name: 'DisplayFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          displayKey: this.col.prop + '_display'
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  computed: {
    value() {
      const displayKey = this.formatterArgs.displayKey
      let value = this.row[displayKey]
      if (value === undefined) {
        value = this.row[this.col.prop]
      }
      return value
    },
    cls() {
      const classChoices = this.formatterArgs?.classChoices
      if (!classChoices) {
        return ''
      }
      return classChoices[this.cellValue]
    },
    booleanValue() {
      return this.normalizeBoolean(this.value) ?? this.normalizeBoolean(this.cellValue)
    },
    isBooleanValue() {
      return this.booleanValue !== null
    },
    booleanText() {
      if (typeof this.value === 'string') {
        const normalized = this.value.trim().toLowerCase()
        if (normalized && normalized !== 'true' && normalized !== 'false') {
          return this.value
        }
      }
      return this.booleanValue ? this.$t('Yes') : this.$t('No')
    }
  },
  methods: {
    normalizeBoolean(value) {
      if (value === true || value === 'true' || value === 'True') {
        return true
      }
      if (value === false || value === 'false' || value === 'False') {
        return false
      }
      return null
    }
  }
}
</script>

<style scoped>
.display-formatter {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-style: normal;
}

.display-formatter.is-boolean {
  white-space: nowrap;
}

.display-formatter .boolean-icon {
  font-style: normal;
}

.display-formatter.is-boolean.text-primary,
.display-formatter.is-boolean .fa-check-circle {
  color: var(--color-primary);
}

.display-formatter.is-boolean.text-danger,
.display-formatter.is-boolean .fa-times-circle {
  color: var(--color-danger);
}
</style>
