<template>
  <div class="container">
    <div class="chat-action">
      <Select2
        v-model="select.value"
        :disabled="isLoading"
        v-bind="select"
        @change="onSelectChange"
      />
    </div>
    <div class="chat-input">
      <el-input
        v-model="inputValue"
        type="textarea"
        :disabled="isLoading"
        :placeholder="$tc('common.InputMessage')"
        @compositionstart="isIM = true"
        @compositionend="isIM = false"
        @compositionstart="isIM = true"
        @keypress.native="onKeyEnter"
      />
      <div class="input-action">
        <span class="right">
          <i class="fa fa-send" :class="{'active': inputValue }" @click="onSendHandle" />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Select2 from '../../../../Form/FormFields/Select2.vue'
import { useChat } from '../../useChat.js'

const { setLoading } = useChat()

export default {
  components: { Select2 },
  props: {
  },
  data() {
    return {
      isIM: false,
      inputValue: '',
      select: {
        url: '/api/v1/settings/chatai-prompts/',
        value: '',
        multiple: false,
        placeholder: this.$t('common.Prompt'),
        ajax: {
          transformOption: (item) => {
            return { label: item.name, value: item.content }
          }
        }
      }
    }
  },
  computed: {
    ...mapState({
      isLoading: state => state.chat.loading
    })
  },
  methods: {
    onKeyEnter(event) {
      if (!this.isIM) {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          this.onSendHandle()
        }
      } else {
        if (event.key === 'Enter' && event.ctrlKey) {
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
      this.inputValue = value
      this.$emit('select-prompt', value)
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
    &>>> .el-select {
      width: 50%;
      .el-input__inner {
        height: 28px;
        line-height: 28px;
        border-radius: 16px;
        border-color: transparent;
        background-color: #f7f7f8;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.45);
        &:hover {
          background-color: #ededed;
        }
      }
      .el-input__icon {
        line-height: 0px;
      }
    }
  }
  .chat-input {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid #DCDFE6;
    border-radius: 12px;
    &:has(.el-textarea__inner:focus) {
      border: 1px solid var(--color-primary);
    }
    &>>> .el-textarea {
      height: 100%;
      .el-textarea__inner {
        height: 100%;
        padding: 8px 10px;
        border: none;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        resize: none;
      }
    }
    .el-textarea.is-disabled + .input-action {
      background-color: #F5F7FA;
      cursor: no-drop;
      i {
        cursor: no-drop;
      }
    }
    .input-action {
      overflow: hidden;
      padding: 0 16px 15px;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
      .right {
        float: right;
        .active {
          color: var(--color-primary);
        }
        i {
          cursor: pointer;
        }
      }
    }
  }
}
</style>