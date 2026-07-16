<template>
  <div>
    <div v-for="(item, index) in currentValue" :key="index" class="value-item">
      <el-input
        :model-value="item"
        class="input-z"
        @update:model-value="updateValue($event, index)"
      />
      <div class="input-button">
        <el-button
          :disabled="disableDelete(item)"
          icon="Minus"
          size="small"
          style="flex-shrink: 0"
          type="danger"
          @click="handleDelete(index)"
        />
        <el-button
          :disabled="disableAdd(item, index)"
          icon="Plus"
          size="small"
          style="flex-shrink: 0"
          type="primary"
          @click="handleAdd(index)"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListField',
  emits: ['input', 'update:modelValue'],
  props: {
    value: {
      type: [Array, String],
      default: () => []
    },
    modelValue: {
      type: [Array, String],
      default: undefined
    }
  },
  computed: {
    currentValue() {
      const value = this.modelValue !== undefined ? this.modelValue : this.value
      return Array.isArray(value) ? value : []
    }
  },
  mounted() {
    if (this.currentValue.length === 0) {
      this.emitValue([''])
    }
  },
  methods: {
    emitValue(value) {
      this.$emit('update:modelValue', value)
      this.$emit('input', value)
    },
    updateValue(v, index) {
      const value = [...this.currentValue]
      value[index] = v
      this.emitValue(value)
    },
    disableDelete() {
      return false
    },
    disableAdd() {
      return false
    },
    handleAdd(index) {
      const value = [...this.currentValue]
      value.splice(index + 1, 0, '')
      this.emitValue(value)
    },
    handleDelete(index) {
      const value = [...this.currentValue]
      value.splice(index, 1)
      this.emitValue(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.input-z {
  flex-shrink: 1;
  width: calc(100% - 80px) !important;
}

.value-item {
  display: flex;
  margin: 4px 0;
}

.input-button {
  display: flex;
  margin-left: 20px;
  margin-top: 4px;
}

.input-button :deep(.el-button.el-button--small) {
  height: 25px;
  padding: 5px;
}
</style>
