<template>
  <div class="container">
    <div class="chat-action">
      <div class="model-select">
        <Select2
          v-model="select.value"
          :disabled="isLoading || isSelectDisabled || loading || !options.length"
          v-bind="select"
          @change="onSelectChange"
        />
      </div>
      <el-dropdown
        :hide-on-click="false"
        trigger="click"
      >
        <span class="el-dropdown-link">
          <i class="fa fa-plug" />
        </span>
        <el-dropdown-menu slot="dropdown">
          <div class="menu-section">
            <div v-if="toolsLoading">
              <i class="el-icon-loading" /> {{ $t('Loading') }}
            </div>
            <div v-else class="menu-body">
              <div>
                <div
                  v-for="item in toolOptions"
                  :key="item.value"
                >
                  <div>
                    <i class="fa fa-wrench item-icon" />
                    <span class="item-label">{{ item.label }}</span>
                    <el-switch
                      :value="selectedToolsSet.has(item.value)"
                      @change="() => toggleTool(item.value)"
                    />
                  </div>
                </div>
                <div
                  v-for="item in toolServerOptions"
                  :key="item.value"
                >
                  <div>
                    <i class="fa fa-server item-icon" />
                    <span class="item-label">{{ item.label }}</span>
                    <el-switch
                      :value="selectedToolServersSet.has(item.value)"
                      @change="() => toggleToolServer(item.value)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="chat-input">
      <el-input
        v-model="inputValue"
        :disabled="isLoading"
        :placeholder="$tc('InputMessage')"
        :rows="expanded ? 3 :2"
        type="textarea"
        @compositionend="isIM = false"
        @compositionstart="isIM = true"
        @keypress.native="onKeyEnter"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { useChat } from '../../useChat.js'
import Select2 from '../../../../Form/FormFields/Select2.vue'

const { setLoading } = useChat()

export default {
  components: { Select2 },
  props: {
    expanded: {
      type: Boolean,
      default: false
    },
    modelOptions: {
      type: Array,
      default: () => []
    },
    selectedModel: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    toolOptions: {
      type: Array,
      default: () => []
    },
    toolServerOptions: {
      type: Array,
      default: () => []
    },
    selectedTools: {
      type: Array,
      default: () => []
    },
    selectedToolServers: {
      type: Array,
      default: () => []
    },
    toolsLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isIM: false,
      inputValue: '',
      select: {
        value: '',
        multiple: false,
        placeholder: this.$t('Model'),
        options: []
      }
    }
  },
  computed: {
    ...mapState({
      isLoading: state => state.chat.loading
    }),
    isSelectDisabled() {
      return false
    },
    options() {
      return (this.modelOptions || []).map(item => {
        return { label: item.name || item.id, value: item.id }
      })
    },
    selectedToolsSet() {
      return new Set(this.selectedTools || [])
    },
    selectedToolServersSet() {
      return new Set(this.selectedToolServers || [])
    }
  },
  watch: {
    modelOptions: {
      immediate: true,
      handler(val) {
        this.select.options = (val || []).map(item => ({ label: item.name || item.id, value: item.id }))
      }
    },
    selectedModel: {
      immediate: true,
      handler(val) {
        this.select.value = val || ''
      }
    }
  },
  methods: {
    onKeyEnter(event) {
      if (event.key === 'Enter') {
        if ((!this.isIM && !event.shiftKey) || (this.isIM && event.ctrlKey)) {
          event.preventDefault()
          this.onSendHandle()
        }
      }
    },
    onSendHandle() {
      if (!this.inputValue) return

      setLoading(true)
      this.$emit('send', this.inputValue)
      this.inputValue = ''
    },
    onSelectChange(value) {
      this.$emit('select-model', value)
    },
    toggleTool(id) {
      const set = new Set(this.selectedTools || [])
      if (set.has(id)) {
        set.delete(id)
      } else {
        set.add(id)
      }
      this.$emit('select-tools', Array.from(set))
    },
    toggleToolServer(id) {
      const set = new Set(this.selectedToolServers || [])
      if (set.has(id)) {
        set.delete(id)
      } else {
        set.add(id)
      }
      this.$emit('select-tool-servers', Array.from(set))
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  height: 100%;
  flex-direction: column;

  .chat-action {
    width: 100%;
    margin: 6px 0;
    display: flex;
    align-items: center;
    gap: 8px;

    .model-select {
      flex: 0 0 48%;
      max-width: 240px;
      min-width: 160px;
    }

    &::v-deep .el-select {
      width: 100%;

      .el-input__inner {
        height: 28px;
        line-height: 28px;
        border-radius: 14px;
        border-color: transparent;
        background-color: #f7f7f8;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.45);

        &:hover {
          background-color: #ededed;
        }
      }

      .el-input__icon {
        line-height: 0;
      }
    }
  }

  .chat-input {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 12px;

    &::v-deep .el-textarea {
      height: 100%;

      .el-textarea__inner {
        height: 100%;
        padding: 8px 10px;
        resize: none;
        border-radius: 5px;

        &::-webkit-scrollbar {
          width: 12px;
        }
      }
    }

    .el-textarea.is-disabled + .input-action {
      background-color: #F5F7FA;
      cursor: no-drop;

      i {
        cursor: no-drop;
      }
    }
  }
}
</style>
