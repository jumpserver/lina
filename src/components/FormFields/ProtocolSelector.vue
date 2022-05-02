<template>
  <div>
    <div v-for="(item, index) in items" :key="index" style="display: flex;margin-top: 8px;">
      <el-input v-model="item.port" class="input-with-select" v-bind="$attrs">
        <el-select slot="prepend" v-model="item.name" @change="handleProtocolChange($event, item)">
          <el-option v-for="p of remainProtocols" :key="p.name" :label="p.name" :value="p.name" />
        </el-select>
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
      default: () => []
    }
  },
  data() {
    return {
      name: '',
      items: []
    }
  },
  computed: {
    protocols() {
      return this.choices.map(item => {
        const proto = item.value.split('/')
        return { name: proto[0], port: proto[1] }
      })
    },
    values() {
      return this.items.map(item => {
        return `${item.name}/${item.port}`
      })
    },
    itemsMap() {
      const mapper = {}
      for (const item of this.items) {
        mapper[item.name] = item
      }
      return mapper
    },
    remainProtocols() {
      return this.protocols.filter(proto => {
        return !this.itemsMap[proto.name]
      })
    }
  },
  watch: {
    values: {
      handler(value) {
        this.$emit('input', value)
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    if (this.value.length !== 0) {
      const items = this.value.map(item => {
        const proto = item.split('/')
        return { name: proto[0], port: proto[1] }
      })
      const protocolsNames = this.protocols.map(item => item.name)
      this.items = items.filter(item => {
        return protocolsNames[item.name]
      })
    } else {
      this.items.push({ ...this.protocols[0] })
    }
    console.log('Choices: ', this.choices)
  },
  methods: {
    onInput(val) {
      this.$emit('input', 'my-input: ' + val)
    },
    handleDelete(index) {
      this.items = this.items.filter((value, i) => {
        return i !== index
      })
    },
    handleAdd(index) {
      this.items.push({ ...this.remainProtocols[0] })
    },
    handleProtocolChange(evt, item) {
      const selected = this.protocols.find(item => item.name === evt)
      item.name = selected.name
      item.port = selected.port
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
</style>
