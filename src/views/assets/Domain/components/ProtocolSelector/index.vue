<template>
  <div class="hide-setting">
    <div v-for="item in items" :key="item.name" style="display: flex;margin-top: 8px;">
      <el-input v-model="item.port" :placeholder="portPlaceholder" class="input-with-select" v-bind="$attrs">
        <el-select
          slot="prepend"
          v-model="item.name"
          class="prepend"
          :disabled="true"
        >
          <el-option :key="item.name" :label="item.name" :value="item.name" />
        </el-select>
      </el-input>
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
      default: () => ([{ 'name': 'ssh', 'port': 22 }])
    }
  },
  data() {
    return {
      name: '',
      items: [],
      settingItem: {},
      showDialog: false
    }
  },
  computed: {
    selectedProtocolNames() {
      return this.items.map(item => item.name)
    },
    remainProtocols() {
      return this.choices
    },
    portPlaceholder() {
      if (this.settingReadonly) {
        return this.$t('applications.port')
      } else {
        return this.$t('assets.DefaultPort')
      }
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
    setDefaultItems(choices) {
      this.items = choices
    }
  }
}
</script>
<style lang="less" scoped>
.el-select .el-input {
  width: 130px;
}

.el-select {
  max-width: 120px;
}

.input-with-select {
  flex-shrink: 1;
  width: calc(100%) !important;
}

.input-with-select .el-input-group__prepend {
  background-color: #fff;
}

.el-select ::v-deep .el-input__inner {
  width: 110px;
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
  padding: 9px 20px;
}
</style>
