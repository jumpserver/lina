<template>
  <div :class="showSetting ? 'show-setting' : 'hide-setting'">
    <div v-for="(item, index) in items" :key="item.name" style="display: flex;margin-top: 8px;">
      <el-input v-model="item.port" :placeholder="portPlaceholder" class="input-with-select" v-bind="$attrs">
        <el-select
          slot="prepend"
          v-model="item.name"
          :disabled="cannotDelete(item)"
          class="prepend"
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
      <div class="input-button" style="display: flex; margin-left: 20px">
        <el-button
          :disabled="cannotDelete(item)"
          icon="el-icon-minus"
          size="mini"
          style="flex-shrink: 0;"
          type="danger"
          @click="handleDelete(index)"
        />
        <el-button
          v-if="index === items.length - 1"
          :disabled="remainProtocols.length === 0 || !item.port"
          icon="el-icon-plus"
          size="mini"
          style="flex-shrink: 0;"
          type="primary"
          @click="handleAdd(index)"
        />
      </div>
    </div>
    <ProtocolSettingDialog
      v-if="showDialog"
      :disabled="settingReadonly"
      :item="settingItem"
      :visible.sync="showDialog"
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
      type: [String, Array],
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
    },
    iChoices() {
      return this.choices.map(item => {
        delete item?.id
        return item
      })
    }
  },
  watch: {
    iChoices: {
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
    this.setDefaultItems(this.iChoices)
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
      const full = this.iChoices.find(choice => {
        return choice.name === item.name
      })
      return full?.primary || full?.required
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
      if (this.value instanceof Array && this.value.length > 0) {
        const protocols = []
        this.value.forEach(item => {
          // 有默认值的情况下，设置为只读或者有id、有setting是平台
          if (!this.settingReadonly || (item?.id && item?.setting)) {
            protocols.push(item)
          } else {
            // 获取资产协议配置
            const assetDefaultItems = this.getAssetDefaultItems(item, choices)
            protocols.push(...assetDefaultItems)
          }
        })
        this.items = protocols
      } else {
        const defaults = choices.filter(item => (item.required || item.primary || item.default))
        this.items = defaults
      }
    },
    getAssetDefaultItems(item, choices) {
      const protocols = []
      const protocol = choices.find(i => i.name === item.name) || {}
      protocols.push({ ...protocol, ...item })

      return protocols
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
