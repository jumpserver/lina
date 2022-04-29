<template>
  <div>
    <div v-for="(item,index) in items" :key="index" style="display: flex;margin-top: 8px;">
      <el-input v-model="item.value" class="input-with-select" v-bind="$attrs">
        <el-select slot="prepend" v-model="item.select" @change="handleProtocolChange">
          <el-option v-for="p of remainProtocols" :key="p.name" :label="p.name" :value="p.name" />
        </el-select>
      </el-input>
      <div style="display: flex; margin-left: 20px" class="input-button">
        <el-button type="danger" icon="el-icon-minus" style="flex-shrink: 0;" size="mini" :disabled="items.length===1" @click="handleDelete(index)" />
        <el-button type="primary" icon="el-icon-plus" style="flex-shrink: 0;" size="mini" @click="handleAdd(index)" />
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
    }
  },
  data() {
    return {
      select: '',
      items: [
        {
          value: '',
          select: ''
        }
      ],
      protocols: [
        {
          name: 'ssh',
          port: 22
        },
        {
          name: 'rdp',
          port: 3389
        },
        {
          name: 'telnet',
          port: 23
        },
        {
          name: 'vnc',
          port: 5901
        }
      ]
    }
  },
  computed: {
    values() {
      const data = []
      this.items.map(i => {
        data.push(`${i.select}/${i.value}`)
      })
      return data
    },
    itemsMap() {
      const mapper = {}
      for (const item of this.items) {
        mapper[item.select] = item
      }
      return mapper
    },
    remainProtocols() {
      const remain = []
      for (const item of this.protocols) {
        if (!this.itemsMap[item.name]) {
          remain.push(item)
        }
      }
      return remain
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
      this.items = []
      this.value.forEach(v => {
        const data = v.split('/')
        this.items.push({
          value: data[1],
          select: data[0]
        })
      })
    }
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
      this.items.push(
        {
          value: '',
          select: ''
        }
      )
    },
    handleProtocolChange(val) {
      let port = 22
      switch (val) {
        case 'rdp':
          port = 3389
          break
        case 'telnet':
          port = 23
          break
        case 'vnc':
          port = 5901
          break
      }
      this.itemsMap[val].value = port
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
    width: 80% !important;
  }

  .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }

  .el-select  ::v-deep  .el-input__inner {
    width: 100px;
  }

  .input-button {
    margin-top: 4px;
  }
  .input-button  ::v-deep  .el-button.el-button--mini {
    height: 25px;
    padding: 5px;
  }
</style>
