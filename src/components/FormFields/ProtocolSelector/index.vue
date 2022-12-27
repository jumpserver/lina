<template>
  <div :class="showSetting ? 'show-setting' : 'hide-setting'">
    <div v-for="(item, index) in items" :key="item.name" style="display: flex;margin-top: 8px;">
      <el-input v-model="item.port" :placeholder="portPlaceholder" class="input-with-select" v-bind="$attrs">
        <el-select
          slot="prepend"
          v-model="item.name"
          class="prepend"
          :disabled="cannotDelete(item)"
          @change="handleProtocolChange($event, item)"
        >
          <el-option v-for="p of remainProtocols" :key="p.name" :label="p.name" :value="p.name" />
        </el-select>
        <el-button
          v-if="showSetting(item)"
          slot="append"
          icon="el-icon-setting"
          @click="onSettingClick(item)"
        />
      </el-input>
      <div style="display: flex; margin-left: 20px" class="input-button">
        <el-button
          type="danger"
          icon="el-icon-minus"
          style="flex-shrink: 0;"
          size="mini"
          :disabled="cannotDelete(item)"
          @click="handleDelete(index)"
        />
        <el-button
          v-if="index === items.length - 1"
          type="primary"
          icon="el-icon-plus"
          style="flex-shrink: 0;"
          size="mini"
          :disabled="remainProtocols.length === 0 || !item.port"
          @click="handleAdd(index)"
        />
      </div>
    </div>
    <ProtocolSettingDialog
      v-if="showDialog"
      :visible.sync="showDialog"
      :item="settingItem"
      :disabled="settingReadonly"
    />
  </div>
</template>

<script>
import ProtocolSettingDialog from './ProtocolSettingDialog'

export default {
  components: {
    ProtocolSettingDialog
  },
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
    settingReadonly: {
      type: Boolean,
      default: false
    },
    showSetting: {
      type: Function,
      default: (item) => true
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
      return this.choices.filter(proto => {
        return this.selectedProtocolNames.indexOf(proto.name) === -1
      })
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
    this.$log.debug('Choices: ', this.choices)
    this.$log.debug('Value: ', this.value)
  },
  methods: {
    handleDelete(index) {
      this.items = this.items.filter((value, i) => {
        return i !== index
      })
    },
    cannotDelete(item) {
      const full = this.choices.find(choice => {
        return choice.name === item.name
      })
      return full.primary || full.required
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
      if (this.value.length > 0) {
        const protocols = []
        this.value.forEach(item => {
          if (item?.id && item?.setting) {
            protocols.push(item)
          } else {
            const protocol = choices.find(i => i.name === item.name)
            if (protocol) protocols.push({ ...protocol, ...item })
          }
        })
        this.items = protocols
      } else {
        const defaults = choices.filter(item => (item.required || item.primary || item.default))
        this.items = defaults
      }
    },
    onSettingClick(item) {
      this.settingItem = item
      this.showDialog = true
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
  width: calc(100% - 80px) !important;
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
