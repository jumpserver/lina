<template>
  <div>
    <div v-for="(item,index) in items" :key="index" style="display: flex;justify-content: space-around;margin-top: 8px;">
      <el-input v-model="item.value" :placeholder="placeholder" class="input-with-select" v-bind="$attrs" @input="onInput" v-on="$listeners">
        <el-select slot="prepend" v-model="item.select" placeholder="请选择">
          <el-option label="ssh" value="ssh" />
          <el-option label="vnc" value="vnc" />
          <el-option label="rdp" value="rdp" />
          <el-option label="telnet" value="telnet" />
        </el-select>
      </el-input>
      <div style="display: flex">
        <el-button type="danger" icon="el-icon-minus" style="flex-shrink: 0;" size="mini" :disabled="items.length===1" @click="handleDelete(index)" />
        <el-button type="success" icon="el-icon-plus" style="flex-shrink: 0;" size="mini" @click="handleAdd(index)" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: Array,
    title: String,
    placeholder: {
      type: String,
      default: () => ''
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
      ]
    }
  },
  computed: {
    values() {
      const data = []
      this.items.map(i => {
        data.push(`${i.value}/${i.select}`)
      })
      return data
    }
  },
  watch: {
    values: {
      handler(value) {
        console.log(value)
        this.$emit('customEvent', value, 'message')
      },
      immediate: true,
      deep: true
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
          value: ' ',
          select: ''
        }
      )
    }
  }
}
</script>
<style lang="less" scoped>
  .el-select .el-input {
    width: 130px;
  }
  .input-with-select{
    flex-shrink: 1;
    width: 80% !important;
  }
  .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }
  .el-select /deep/ .el-input__inner{
    width: 100px;
  }
</style>
