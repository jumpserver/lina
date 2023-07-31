<template>
  <div>
    <div v-for="(item, index) in value || []" :key="index" class="value-item">
      <el-input :value="item" class="input-z" @input="updateValue($event, index)" />
      <div class="input-button">
        <el-button
          :disabled="disableDelete(item)"
          icon="el-icon-minus"
          size="mini"
          style="flex-shrink: 0;"
          type="danger"
          @click="handleDelete(index)"
        />
        <el-button
          :disabled="disableAdd(item, index)"
          icon="el-icon-plus"
          size="mini"
          style="flex-shrink: 0;"
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
  props: {
    value: {
      type: [Array, String],
      default: () => ([])
    }
  },
  data() {
    return {
    }
  },
  computed: {
  },
  mounted() {
    const value = this.value
    if (!value || !Array.isArray(value) || value.length === 0) {
      this.$emit('input', [''])
    }
  },
  methods: {
    updateValue(v, index) {
      const value = this.value
      value[index] = v
      this.$emit('input', value)
    },
    disableDelete() {
      return false
    },
    disableAdd() {
      return false
    },
    handleAdd(index) {
      const value = this.value
      value.splice(index + 1, 0, '')
      this.$emit('input', value)
    },
    handleDelete(index) {
      const value = this.value
      value.splice(index, 1)
      this.$emit('input', value)
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

.input-button ::v-deep .el-button.el-button--mini {
  height: 25px;
  padding: 5px;
}

</style>
