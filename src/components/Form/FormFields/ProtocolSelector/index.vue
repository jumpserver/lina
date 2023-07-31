<template>
  <div v-if="!loading" :class="showSetting ? 'show-setting' : 'hide-setting'">
    <div v-for="(item, index) in items" :key="item.name" class="protocol-item">
      <el-input
        v-model="item.port"
        :class="isPortReadonly(item) ? '' : 'input-with-select'"
        :placeholder="portPlaceholder"
        :readonly="isPortReadonly(item)"
        :title="isPortReadonly(item) ? '端口由 URL 指定' : ''"
        v-bind="$attrs"
      >
        <template #prepend>
          <el-select
            :disabled="disableSelect(item)"
            :value="item.display_name ? item.display_name : item.name"
            class="prepend"
            @change="handleProtocolChange($event, item)"
          >
            <el-option
              v-for="p of remainProtocols"
              :key="p.name"
              :label="p.name"
              :value="p.name"
            />
          </el-select>
        </template>
        <template #append>
          <el-button
            v-if="showSetting(item)"
            icon="el-icon-setting"
            @click="onSettingClick(item)"
          />
        </template>
      </el-input>
      <div v-if="!readonly" class="input-button">
        <el-button
          :disabled="disableDelete(item)"
          icon="el-icon-minus"
          size="mini"
          style="flex-shrink: 0;"
          type="danger"
          @click="handleDelete(index)"
        />
        <el-button
          v-if="index === items.length - 1"
          :disabled="disableAdd(item, index)"
          icon="el-icon-plus"
          size="mini"
          style="flex-shrink: 0;"
          type="primary"
          @click="handleAdd(index)"
        />
      </div>
    </div>
    <el-button
      v-if="items.length === 0"
      icon="el-icon-plus"
      size="mini"
      style="flex-shrink: 0;"
      type="primary"
      @click="handleAdd(0)"
    />
    <ProtocolSettingDialog
      v-if="showDialog"
      :disabled="settingReadonly || readonly"
      :protocol="currentProtocol"
      :visible.sync="showDialog"
      @confirm="handleSettingConfirm"
    />
  </div>
</template>

<script>
import ProtocolSettingDialog from './ProtocolSettingDialog.vue'

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
    readonly: {
      // 这个是在详情中，不可编辑，包括所有
      type: Boolean,
      default: false
    },
    settingReadonly: {
      // 这个是在资产添加时设置协议使用，不能修改 setting
      type: Boolean,
      default: false
    },
    showSetting: {
      type: Function,
      default: (item) => true
    },
    instance: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      name: '',
      items: [],
      currentProtocol: {},
      showDialog: false,
      loading: false
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
    choices: {
      handler(value, oldValue) {
        if (value?.length === oldValue?.length) {
          return
        }
        this.loading = true
        setTimeout(() => {
          this.setDefaultItems(value)
          this.loading = false
        },)
      },
      deep: true,
      immediate: true
    },
    items: {
      handler(value) {
        if (this.settingReadonly) {
          value = value.map(i => {
            return { name: i.name, port: i.port }
          })
        }
        this.$emit('input', value)
      },
      immediate: true,
      deep: true
    },
    instance: {
      handler(value) {
        const port = this.getPortFromInstance(value)
        if (!port) {
          return
        }
        for (const item of this.items) {
          if (item['port_from_addr']) {
            item.port = port
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.setDefaultItems(this.iChoices)
    this.$log.debug('Choices: ', this.choices)
    this.$log.debug('Value: ', this.value)
    this.$log.debug('Items: ', this.items)
  },
  methods: {
    getPortFromInstance(instance) {
      if (!instance) {
        return 0
      }
      let address = instance.address || ''
      if (address.indexOf('://') === -1) {
        address = `https://${address}`
      }
      const parse = require('url-parse')
      const path = parse(address)
      let port = path.port
      if (port < 0 || port > 65535) {
        port = 0
      }
      if (!port) {
        port = path.protocol === 'https:' ? 443 : 80
      }
      return port
    },
    handleSettingConfirm() {
      if (this.currentProtocol.primary) {
        const others = this.items
          .filter(item => item.name !== this.currentProtocol.name)
          .map(item => {
            item.primary = false
            return item
          })
        this.items = [this.currentProtocol, ...others]
      }
      if (this.currentProtocol.name === 'winrm') {
        if (this.currentProtocol.setting?.use_ssl) {
          this.currentProtocol.port = 5986
        } else {
          this.currentProtocol.port = 5985
        }
      }
    },
    handleDelete(index) {
      this.items = this.items.filter((value, i) => i !== index)
    },
    isRequired(item) {
      const full = this.iChoices.find(choice => {
        return choice.name === item.name
      })
      return full?.primary || full?.required
    },
    disableSelect(item) {
      return this.isRequired(item)
    },
    disableDelete(item) {
      if (this.items.length === 1) {
        return true
      }
      // 代表是设置平台
      if (!this.settingReadonly) {
        return false
      }
      return this.isRequired(item)
    },
    disableAdd(item) {
      return this.remainProtocols.length === 0 || !item.port
    },
    handleAdd(index) {
      this.items.push({ ...this.remainProtocols[0] })
    },
    handleProtocolChange(evt, item) {
      const selected = this.choices.find(item => item.name === evt)
      item.name = selected.name
      item.port = selected.port
    },
    isPortFormAddr(item) {
      return !!item['port_from_addr']
    },
    isPortReadonly(item) {
      return this.readonly || this.isPortFormAddr(item)
    },
    setPrimaryIfNeed(items) {
      // 如果没有设置主协议，设置第一个为主协议
      if (this.settingReadonly) {
        return items
      }
      const primaryProtocols = items.filter(item => item.primary)
      if (primaryProtocols.length === 0) {
        items[0].default = true
        items[0].public = true
      } else if (primaryProtocols.length > 1) {
        primaryProtocols.slice(1, primaryProtocols.length).forEach(item => {
          item.primary = false
        })
      }
      return items
    },
    setDefaultItems(choices) {
      let items = []
      const requiredItems = choices.filter(item => (item.required || item.primary))

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
        const notFound = requiredItems.filter(item => !protocols.find(p => p.name === item.name))
        protocols.push(...notFound)
        const allProtocolNames = protocols.map(item => item.name)
        items = protocols.filter(item => allProtocolNames.indexOf(item.name) !== -1)
      } else {
        const defaults = choices.filter(item => (item.required || item.primary || item.default))
        if (defaults.length === 0 && choices.length !== 0) {
          defaults.push(choices[0])
        }
        items = defaults
      }
      items = this.setPrimaryIfNeed(items)
      this.items = items
    },
    getAssetDefaultItems(item, choices) {
      const protocols = []
      const protocol = choices.find(i => i.name === item.name) || {}
      protocols.push({ ...protocol, ...item })
      return protocols
    },
    onSettingClick(item) {
      this.currentProtocol = item
      this.showDialog = true
    }
  }
}
</script>
<style lang="scss" scoped>
.el-select >>> .el-input__inner {
  width: 120px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-with-select {
  flex-shrink: 1;
  width: calc(100% - 80px) !important;
}

.input-with-select .el-input-group__prepend {
  background-color: #fff;
}

.protocol-item {
  display: flex;
  margin: 5px 0;
}

.input-button {
  margin-top: 4px;
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
