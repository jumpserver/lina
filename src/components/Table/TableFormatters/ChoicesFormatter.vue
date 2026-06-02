<template>
  <span>
    <el-tooltip v-if="shown" :disabled="!formatterArgs.hasTips" :open-delay="500" effect="dark" placement="bottom">
      <template #content>
        <div v-sanitize="tips" />
      </template>
      <span :class="classes" class="choice-cell">
        <i v-if="formatterArgs.showIcon && icon" :class="'fa ' + icon" />
        <span v-if="formatterArgs.showText" class="choice-text">{{ text }}</span>
      </span>
    </el-tooltip>
    <span v-else>-</span>
  </span>
</template>

<script>
import i18n from '@/i18n/i18n'
import BaseFormatter from './base.vue'

function getChoiceKey(value) {
  if (value && typeof value === 'object') {
    return value.value ?? value.key ?? value.id ?? value.name ?? value.label
  }
  return value
}

function getChoiceLabel(value) {
  if (value && typeof value === 'object') {
    const label = value.label ?? value.display_name ?? value.name ?? value.value ?? '-'
    return label && typeof label === 'object' ? JSON.stringify(label) : label
  }
  return value
}

function getChoiceMapValue(map, key) {
  if (!map) {
    return undefined
  }
  return map[key] ?? map[String(key)]
}

const formatterArgsDefault = {
  faChoices: {
    true: 'fa-check-circle',
    false: 'fa-times-circle'
  },
  classChoices: {
    true: 'text-primary',
    false: 'text-danger'
  },
  getKey({ row, cellValue }) {
    return getChoiceKey(cellValue)
  },
  getText({ row, cellValue }) {
    const key = this.getKey({ row, cellValue })
    const text = getChoiceMapValue(this.textChoices, key)
    if (text !== undefined) {
      return text
    }
    if (key === true || key === 'true') return i18n.t('Yes')
    if (key === false || key === 'false') return i18n.t('No')
    return getChoiceLabel(cellValue)
  },
  getIcon({ row, cellValue }) {
    const key = this.getKey({ row, cellValue })
    return getChoiceMapValue(this.faChoices, key)
  },
  hasTips: false,
  showIcon: true,
  showText: true,
  showFalse: true,
  getTips: ({ row, cellValue }) => {
    return cellValue
  }
}

export default {
  name: 'ChoicesFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return { ...formatterArgsDefault }
      }
    }
  },
  formatterArgsDefault: formatterArgsDefault,
  data() {
    return {
      formatterArgs: Object.assign({}, this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  computed: {
    textChoices() {
      return this.formatterArgs.textChoices || null
    },
    key() {
      const k = this.formatterArgs.getKey(
        { row: this.row, cellValue: this.cellValue }
      )
      return k
    },
    icon() {
      const icon = this.formatterArgs.getIcon(
        { row: this.row, cellValue: this.cellValue }
      )
      return icon
    },
    classes() {
      return getChoiceMapValue(this.formatterArgs.classChoices, this.key) || ''
    },
    text() {
      return this.formatterArgs.getText(
        { row: this.row, cellValue: this.cellValue }
      )
    },
    tips() {
      const tips = this.formatterArgs.getTips({ cellValue: this.cellValue, row: this.row })
      return getChoiceLabel(tips)
    },
    shown() {
      const isFalseLike = [false, 'false', 0, '0', '', null, undefined].includes(this.key)
      if (!this.formatterArgs.showFalse && isFalseLike) {
        return false
      }
      return true
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.choice-cell {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-style: normal;
  line-height: 1;

  i,
  .fa {
    font-style: normal;
    line-height: 1;
  }
}

.choice-text {
  font-style: normal;
  line-height: 1.4;
}
</style>
