<template>
  <div class="container">
    <div class="chat-action">
      <el-select
        :model-value="selectedPrompt"
        :disabled="isLoading || promptsLoading"
        :loading="promptsLoading"
        :placeholder="$t('Role')"
        clearable
        @update:model-value="onSelectPrompt"
      >
        <el-option
          v-for="option in promptOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </div>
    <div class="chat-input">
      <el-input
        v-model="inputValue"
        :disabled="isLoading"
        :placeholder="$tc('InputMessage')"
        :rows="expanded ? 3 : 2"
        type="textarea"
        @compositionend="isIM = false"
        @compositionstart="isIM = true"
        @keypress="onKeyEnter"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { useChat } from '../../useChat.js'

const { setLoading } = useChat()

export default {
  props: {
    expanded: {
      type: Boolean,
      default: false
    },
    promptOptions: {
      type: Array,
      default: () => []
    },
    selectedPrompt: {
      type: String,
      default: ''
    },
    promptsLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isIM: false,
      inputValue: ''
    }
  },
  computed: {
    ...mapState({
      isLoading: (state) => state.chat.loading
    })
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
    onSelectPrompt(value) {
      this.$emit('select-prompt', value || '')
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

    &:deep(.el-select) {
      width: 50%;

      .el-select__wrapper {
        box-sizing: border-box;
        min-height: 28px;
        height: 28px;
        border-radius: 14px;
        border-color: rgba(0, 0, 0, 0);
        box-shadow: 0 0 0 1px transparent inset;
        background-color: #f7f7f8;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.45);

        &:hover {
          background-color: #ededed;
          box-shadow: 0 0 0 1px transparent inset;
        }
      }

      .el-select__selected-item,
      .el-select__placeholder,
      .el-select__caret {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.45);
      }
    }
  }

  .chat-input {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 12px;

    &:deep(.el-textarea) {
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
  }
}
</style>
