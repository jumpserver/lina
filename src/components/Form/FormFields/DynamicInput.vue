<template>
  <div>
    <div v-for="(command, index) in iValue" :key="index" :prop="'iValue.' + index + '.value'" class="command-item">
      <el-input v-model="iValue[index]" size="mini">
        <template slot="prepend"> {{ inputTitle + ' ' + (index + 1) }}</template>
      </el-input>
      <div class="input-button">
        <el-button
          :disabled="deleteDisabled()"
          icon="el-icon-minus"
          size="mini"
          style="flex-shrink: 0;"
          type="danger"
          @click="handleDelete(command)"
        />
        <el-button
          v-if="index === iValue.length - 1"
          icon="el-icon-plus"
          size="mini"
          style="flex-shrink: 0;"
          type="primary"
          @click="handleAdd()"
        />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    value: {
      type: Array,
      default: () => ['']
    },
    inputTitle: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      iValue: ['']
    }
  },
  watch: {
    iValue: {
      handler(v) {
        this.$emit('input', Array.from(v))
      }
    }
  },
  created() {
    this.iValue = Array.from(this.value)
  },
  methods: {
    handleDelete(command) {
      const index = this.iValue.indexOf(command)
      if (index !== -1) {
        this.iValue.splice(index, 1)
      }
    },
    handleAdd() {
      this.iValue.push('')
    },
    deleteDisabled() {
      return this.iValue.length <= 1
    }
  }
}
</script>

<style lang="scss" scoped>
.el-input {
  width: 85%;
}
.command-item {
  display: flex;
  margin: 5px 0;
}
.input-button {
  margin-top: 2px;
  display: flex;
  margin-left: 20px
}
.input-button ::v-deep .el-button.el-button--mini {
  height: 25px;
  padding: 5px;
}
.el-input-group__append .el-button {
  font-size: 14px;
  color: #1a1a1a;
  padding: 9px 20px;
}
</style>
