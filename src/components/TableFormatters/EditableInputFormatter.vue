<template>
  <div style="width: 100%;min-height: 20px" @click.stop="editCell">
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
            this.$log.debug(`Set value ${oldValue} => ${newValue}`)
            this.$set(row, prop, newValue)
          }
        }
      }
    }
  },
  data() {
    const valueIsString = typeof this.cellValue === 'string'
    const jsonValue = this.cellValue ? JSON.stringify(this.cellValue) : ''
    return {
      inEditMode: false,
      value: valueIsString ? this.cellValue || '' : jsonValue,
      valueIsString: valueIsString,
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  methods: {
    editCell() {
      this.inEditMode = true
    },
    onInputEnter() {
      let validValue = this.value
      try {
        validValue = JSON.parse(validValue)
      } catch (e) {
        // pass
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
