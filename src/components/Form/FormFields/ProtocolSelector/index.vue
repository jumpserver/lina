<template>
  <div :class="showSetting ? 'show-setting' : 'hide-setting'">
    <div v-for="(item, index) in items" :key="item.name" class="protocol-item">
      <el-input
        v-bind="passAttrs"
        v-model="item.port"
        class="jms-input-spacing"
        :class="isPortReadonly(item) ? 'keep-inner-border' : 'input-with-select keep-inner-border'"
        :placeholder="portPlaceholder"
        :readonly="isPortReadonly(item)"
        :title="isPortReadonly(item) ? '端口由 URL 指定' : ''"
      >
        <template #prepend>
          <el-select
            :disabled="disableSelect(item)"
            :model-value="item.name"
            class="prepend"
            @change="handleProtocolChange($event, item)"
          >
            <el-option
              v-for="p of protocolOptions(item)"
              :key="p.name"
              :label="p.display_name || p.name"
              :value="p.name"
            />
          </el-select>
        </template>
        <template #append>
          <div v-if="showSetting(item)" class="protocol-setting-append">
            <el-button
              class="protocol-setting-button"
              icon="Setting"
              @click="onSettingClick(item)"
            />
          </div>
        </template>
      </el-input>

      <div v-if="!readonly" class="input-button">
        <el-button
          :disabled="disableDelete(item)"
          icon="Minus"
          size="small"
          style="flex-shrink: 0"
          type="danger"
          @click="handleDelete(index)"
        />
        <el-button
          v-if="index === items.length - 1"
          :disabled="disableAdd(item, index)"
          icon="Plus"
          size="small"
          style="flex-shrink: 0"
          type="primary"
          @click="handleAdd(index)"
        />
      </div>
    </div>
    <el-button
      v-if="items.length === 0"
      icon="Plus"
      size="small"
      style="flex-shrink: 0"
      type="primary"
      @click="handleAdd(0)"
    />
    <ProtocolSettingDialog
      v-if="showDialog"
      v-model:visible="showDialog"
      :disabled="settingReadonly || readonly"
      :protocol="currentProtocol"
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
  // Vue3 中父组件的事件监听器会合并进 $attrs。若把 $attrs 原样透传给内部端口输入框，
  // 表单渲染器注入的 onInput/onChange/onUpdate:modelValue 就会绑到内部 el-input 上，
  // 用户输入端口时把字符串 port 当作整个协议字段的值向上抛出，触发
  // "value.map is not a function"。因此关闭自动继承，并只透传非事件属性。
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Array],
      default: () => []
    },
    modelValue: {
      type: [String, Array],
      default: undefined
    },
    title: {
      type: String,
      default: ''
    },
    choices: {
      type: Array,
      default: () => []
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
      showDialog: false
    }
  },
  computed: {
    externalValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    passAttrs() {
      // 只把非事件监听的属性透传给内部端口输入框，过滤掉 onXxx 事件，
      // 协议字段的值只经由本组件的 $emit('input', items) 上报。
      const out = {}
      for (const key of Object.keys(this.$attrs)) {
        if (/^on[A-Z]/.test(key)) continue
        out[key] = this.$attrs[key]
      }
      return out
    },
    selectedProtocolNames() {
      return this.items.map((item) => item.name)
    },
    remainProtocols() {
      return this.choices.filter((proto) => {
        return this.selectedProtocolNames.indexOf(proto.name) === -1
      })
    },
    portPlaceholder() {
      if (this.settingReadonly) {
        return this.$t('Port')
      } else {
        return this.$t('DefaultPort')
      }
    },
    iChoices() {
      return this.choices.map((item) => {
        delete item?.id
        return item
      })
    }
  },
  watch: {
    externalValue: {
      handler(value) {
        if (this.hasSamePorts(this.items, value)) {
          return
        }
        this.setDefaultItems(this.iChoices)
      },
      deep: true
    },
    choices: {
      handler(value) {
        setTimeout(() => {
          this.setDefaultItems(value)
        })
      },
      deep: true,
      immediate: true
    },
    items: {
      // 初始化时不能立即上报：items 还未根据接口值生成，空数组会覆盖表单中的 protocols。
      handler(value) {
        if (this.settingReadonly) {
          value = value.map((i) => {
            return { name: i.name, port: i.port }
          })
        }
        this.$emit('input', value)
      },
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
    protocolOptions(item) {
      return this.choices.filter((proto) => {
        return proto.name === item.name || this.selectedProtocolNames.indexOf(proto.name) === -1
      })
    },
    getPortFromInstance(instance) {
      if (!instance) {
        return 0
      }
      let address = instance.address || ''
      if (address.indexOf('://') === -1) {
        address = `https://${address}`
      }
      let url
      try {
        url = new URL(address)
      } catch (error) {
        return 0
      }
      let port = Number(url.port)
      if (port < 0 || port > 65535) {
        port = 0
      }
      if (!port) {
        port = url.protocol === 'https:' ? 443 : 80
      }
      return port
    },
    handleSettingConfirm(form) {
      // 弹窗内 protocol 为只读 prop，配置在此合并到当前协议项（父组件自有的响应式数据，可写）。
      if (form) {
        Object.assign(this.currentProtocol, form)
      }
      if (this.currentProtocol.primary) {
        const others = this.items
          .filter((item) => item.name !== this.currentProtocol.name)
          .map((item) => {
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
      const full = this.iChoices.find((choice) => {
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
      const selected = this.choices.find((item) => item.name === evt)
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
      const primaryProtocols = items.filter((item) => item.primary)
      if (primaryProtocols.length === 0) {
        items[0].default = true
        items[0].public = true
      } else if (primaryProtocols.length > 1) {
        primaryProtocols.slice(1, primaryProtocols.length).forEach((item) => {
          item.primary = false
        })
      }
      return items
    },
    setDefaultItems(choices) {
      let items = []
      const requiredItems = choices.filter((item) => item.required || item.primary)

      if (this.externalValue instanceof Array && this.externalValue.length > 0) {
        const protocols = []
        this.externalValue.forEach((item) => {
          // 有默认值的情况下，设置为只读或者有id、有setting是平台
          if (!this.settingReadonly || (item?.id && item?.setting)) {
            protocols.push(item)
          } else {
            // 获取资产协议配置
            const assetDefaultItems = this.getAssetDefaultItems(item, choices)
            protocols.push(...assetDefaultItems)
          }
        })
        const notFound = requiredItems.filter(
          (item) => !protocols.find((p) => p.name === item.name)
        )
        protocols.push(...notFound)
        const allProtocolNames = protocols.map((item) => item.name)
        items = protocols.filter((item) => allProtocolNames.indexOf(item.name) !== -1)
      } else {
        const defaults = choices.filter((item) => item.required || item.primary || item.default)
        if (defaults.length === 0 && choices.length !== 0) {
          defaults.push(choices[0])
        }
        items = defaults
      }
      items = this.setPrimaryIfNeed(items)
      this.items = items
    },
    hasSamePorts(items, value) {
      if (!Array.isArray(value) || items.length !== value.length) {
        return false
      }
      return items.every((item, index) => {
        const incoming = value[index]
        return incoming?.name === item.name && String(incoming?.port) === String(item.port)
      })
    },
    getAssetDefaultItems(item, choices) {
      const protocol = choices.find((i) => i.name === item.name)
      if (!protocol) {
        return choices.length === 0 ? [{ ...item }] : []
      }
      return [{ ...protocol, ...item }]
    },
    onSettingClick(item) {
      this.currentProtocol = item
      this.showDialog = true
    }
  }
}
</script>
<style lang="scss" scoped>
.show-setting,
.hide-setting {
  width: 100%;
}

.prepend {
  width: 120px;

  :deep(.el-select__wrapper) {
    width: 120px;
    background-color: #f5f7fa;
    box-shadow: none !important;

    .el-select__selected-item,
    .el-select__placeholder {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.protocol-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 58px;
  align-items: center;
  column-gap: 20px;
  min-height: 30px;
  margin: 5px 0;

  &:first-of-type {
    margin-top: 0;
  }

  & .el-input {
    height: 30px !important;
  }
}

.input-with-select {
  flex: 1 1 auto;
  width: auto !important;
  min-width: 0;

  :deep(.el-input-group__prepend) {
    background-color: #f5f7fa;
    border-right: 0;
  }

  :deep(.el-input-group__prepend),
  :deep(.el-input-group__append),
  :deep(.el-input__wrapper) {
    border-radius: 0;
  }

  // 中间 input 保留左右 border 作为分隔线（配合 .keep-inner-border，
  // 让 DataForm 不再清除接缝处 border）；select 右侧 / button 左侧仍不描边。

  :deep(.el-input-group__append) {
    display: flex;
    align-items: stretch;
    padding: 0;
    background-color: #f5f7fa;
    border-top: 1px solid var(--el-border-color) !important;
    border-right: 1px solid var(--el-border-color) !important;
    border-bottom: 1px solid var(--el-border-color) !important;
    border-left: 0 !important;
    box-shadow: none;
  }

  :deep(.protocol-setting-append) {
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    width: 57px;
    min-width: 57px;
    height: 100%;
    background-color: #f5f7fa;
  }

  :deep(.protocol-setting-button) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 auto;
    width: 57px;
    min-width: 57px;
    height: 100%;
    margin: 0;
    padding: 0;
    font-size: 14px;
    color: #1a1a1a;
    border: 0 !important;
    border-radius: 0;
    background-color: #f5f7fa !important;
    box-shadow: none !important;
  }

  :deep(.protocol-setting-button > span) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  :deep(.el-select__selected-item),
  :deep(.el-select__placeholder) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// focus 时只让中间 input 高亮：input 自身的 .is-focus 会把它四条边（含左右分隔线）变成主色，
// 右侧分隔线即由 input 右 border 提供。select 与设置按钮（append）保持灰色、不参与聚焦，
// 因此这里不再对 prepend / append 追加 focus 描边（避免设置按钮被“框”成独立主色块）。

.input-button {
  display: grid;
  grid-template-columns: repeat(2, 25px);
  align-items: center;
  flex: 0 0 auto;
  height: 30px;
  gap: 8px;
  width: 58px;
  margin-left: 0;

  :deep(.el-button.el-button--small) {
    width: 25px;
    min-width: 25px;
    height: 25px;
    min-height: 25px;
    padding: 5px;
    margin-left: 0;
    align-self: center;
  }

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }

  :deep(.el-button--danger) {
    grid-column: 1;
  }

  :deep(.el-button--primary) {
    grid-column: 2;
  }
}
</style>
