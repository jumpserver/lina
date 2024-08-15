<template>
  <div class="edit-container" style="min-height: 20px" @click.stop="editCell">
    <el-input
      v-if="inEditMode"
      ref="inputRef"
      v-model="value"
      class="editInput"
      size="mini"
      @blur="onInputEnter"
      @keyup.enter.native="onInputEnter"
    />
    <template v-else>
      <span class="cellValue">{{ iCellValue }}</span>
      <a
        v-if="formatterArgs.showEditBtn"
        :class="[{ 'disabled-link': this.$store.getters.currentOrgIsRoot },'edit-btn']"
        style="padding-left: 5px"
        @click="editCell"
      >
        <i class="fa fa-edit" />
      </a>
    </template>

  </div>
</template>

<script>
import BaseFormatter from './base.vue'

export default {
  name: 'EditableInputFormatter',
  components: {},
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
  computed: {
    iCellValue() {
      if (Array.isArray(this.cellValue)) {
        if (this.cellValue.length === 0) {
          return ''
        }
        return this.cellValue.map(v => this.getCellValue(v)).join(', ')
      }
      return this.getCellValue(this.cellValue)
    }
  },
  methods: {
    editCell() {
      if (this.formatterArgs.canEdit) {
        this.inEditMode = true
        this.$nextTick(() => {
          this.$refs.inputRef.focus()
        })
      }
    },
    getCellValue(val) {
      let v = ''
      if (val && typeof val === 'object') {
        v = val['name'] || val['display_name'] || JSON.stringify(val)
      }
      return v || val
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
    }
  }
}
</script>

<style lang="scss" scoped>
.editInput ::v-deep .el-input__inner {
  padding: 2px;
  line-height: 12px;
}

.editInput {
  padding: -6px;
}

.edit-btn {
  visibility: hidden;
  position: relative;
  transition: all 1s;

  & > i {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

}

.edit-container {
  display: flex;
  flex-wrap: nowrap;

  &:hover {
    .edit-btn {
      visibility: visible;
    }
  }

  .cellValue {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

</style>
