<template>
  <div v-if="!loading" :class="showSetting ? 'show-setting' : 'hide-setting'">
    <div v-for="(item, index) in items" :key="item.name" class="protocol-item">
      <el-input
        v-model="item.port"
        :class="readonly ? '' : 'input-with-select'"
        :placeholder="portPlaceholder"
        :readonly="readonly"
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
      :item="settingItem"
      :visible.sync="showDialog"
      @confirm="handleSettingConfirm"
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
    readonly: {
      type: Boolean,
      default: false
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
      handler(value) {
        this.loading = true
        setTimeout(() => {
          this.loading = false
          this.setDefaultItems(value)
        }, 100)
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
    this.$log.debug('Items: ', this.items)
  },
  methods: {
    handleSettingConfirm() {
      if (this.settingItem.primary) {
        const others = this.items
          .filter(item => item.name !== this.settingItem.name)
          .map(item => {
            item.primary = false
            return item
          })
        this.items = [this.settingItem, ...others]
      }
      if (this.settingItem.name === 'winrm') {
        if (this.settingItem.setting?.use_ssl) {
          this.settingItem.port = 5986
        } else {
          this.settingItem.port = 5985
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
    setPrimaryIfNeed(items) {
      // 如果没有设置主协议，设置第一个为主协议
      if (!this.settingReadonly) {
        const primaryProtocols = items.filter(item => item.primary)
        if (primaryProtocols.length === 0) {
          items[0].primary = true
          items[0].default = true
          items[0].required = true
        } else if (primaryProtocols.length > 1) {
          primaryProtocols.slice(1, primaryProtocols.length).forEach(item => {
            item.primary = false
          })
        }
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
        if (defaults.length === 0) {
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
      this.settingItem = item
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
