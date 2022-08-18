<template>
  <div>
    <div v-for="(item, index) in items" :key="item.name" style="display: flex;margin-top: 8px;">
      <el-input v-model="item.port" class="input-with-select" v-bind="$attrs">
        <el-select slot="prepend" v-model="item.name" class="prepend" @change="handleProtocolChange($event, item)">
          <el-option v-for="p of remainProtocols" :key="p.name" :label="p.name" :value="p.name" />
        </el-select>
        <el-button v-if="showSetting" slot="append" icon="el-icon-setting" @click="onSettingClick(item)" />
      </el-input>
      <div style="display: flex; margin-left: 20px" class="input-button">
        <el-button
          type="danger"
          icon="el-icon-minus"
          style="flex-shrink: 0;"
          size="mini"
          :disabled="items.length === 1"
          @click="handleDelete(index)"
        />
        <el-button
          v-if="index === items.length - 1"
          type="primary"
          icon="el-icon-plus"
          style="flex-shrink: 0;"
          :disabled="remainProtocols.length === 0 || !item.port"
          size="mini"
          @click="handleAdd(index)"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [Array],
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    choices: {
      type: Array,
      default: () => ([])
    },
    showSetting: {
      type: Boolean,
      default: false
    },
    onSettingClick: {
      type: Function,
      default: (item) => {
        alert('Click setting: ' + item.name + ', port: ' + item.port)
      }
    }
  },
  data() {
    return {
      name: '',
      items: []
    }
  },
  computed: {
    selectedProtocolNames() {
      return this.items.map(item => item.name)
    },
    remainProtocols() {
      return this.choices.filter(proto => {
        return this.selectedProtocolNames.indexOf(proto.name) === -1
      })
    }
  },
  watch: {
    choices: {
      handler(value) {
        this.setDefaultItems(value)
      }
    },
    items: {
      handler(value) {
        this.$emit('input', value)
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.setDefaultItems(this.choices)
  },
  methods: {
    handleDelete(index) {
      this.items = this.items.filter((value, i) => {
        return i !== index
      })
    },
    handleAdd(index) {
      this.items.push({ ...this.remainProtocols[0] })
    },
    handleProtocolChange(evt, item) {
      const selected = this.choices.find(item => item.name === evt)
      item.name = selected.name
      item.port = selected.port
    },
    setDefaultItems(choices) {
      if (this.value && this.value.length > 0) {
        this.items = [...this.value]
        return
      }
      if (choices.length !== 0) {
        this.items = [choices[0]]
      }
    }
  }
}
</script>
<style lang="less" scoped>
.el-select .el-input {
  width: 130px;
}

.input-with-select {
  flex-shrink: 1;
  width: calc(100% - 80px) !important;
}

.input-with-select .el-input-group__prepend {
  background-color: #fff;
}

.el-select ::v-deep .el-input__inner {
  width: 100px;
}

.input-button {
  margin-top: 4px;
}

.input-button ::v-deep .el-button.el-button--mini {
  height: 25px;
  padding: 5px;
}
.el-input-group__append .el-button {
  font-size: 14px;
  color: #1a1a1a;
}
</style>
