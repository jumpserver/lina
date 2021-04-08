<template>
  <div @click.stop="editCell">
    <el-input
      v-if="inEditMode"
      v-model="value"
      size="mini"
      class="editInput"
      @keyup.enter.native="onInputEnter"
      @blur="onInputEnter"
    />
    <template v-else>
      <span>{{ cellValue }}</span>
    </template>
  </div>
</template>

<script>
import BaseFormatter from './base'

export default {
  name: 'EditableInputFormatter',
  components: {
  },
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          trigger: 'click',
          onEnter: ({ row, col, oldValue, newValue }) => {
            const prop = col.prop
            row[prop] = newValue
          }
        }
      }
    }
  },
  data() {
    const valueIsString = typeof this.cellValue === 'string'
    const jsonValue = JSON.stringify(this.cellValue)
    return {
      inEditMode: false,
      value: valueIsString ? this.cellValue : jsonValue,
      valueIsString: valueIsString,
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  methods: {
    editCell() {
      this.inEditMode = true
    },
    onInputEnter() {
      let validValue = ''
      if (this.valueIsString) {
        validValue = this.value
      } else {
        validValue = JSON.parse(validValue)
      }
      this.formatterArgs.onEnter({
        row: this.row, col: this.col,
        oldValue: this.cellValue,
        newValue: validValue
      })
      this.inEditMode = false
    },
    cancelEdit() {
      this.inEditMode = false
    }
  }
}
</script>

<style scoped>
.editInput >>> .el-input__inner {
  padding: 2px;
  line-height: 12px;
}

.editInput {
  padding: -6px;
}
</style>
