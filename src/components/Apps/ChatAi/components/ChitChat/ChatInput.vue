<template>
  <div class="container">
    <div class="chat-input">
      <el-input
        v-model="value"
        :disabled="isLoading"
        :placeholder="$t('common.EnterMessage')"
        type="textarea"
        @compositionend="isIM = false"
        @compositionstart="isIM = true"
        @keypress.native="onKeyEnter"
      />
      <div class="input-action">
        <span class="right">
          <i :class="{'active': value }" class="fa fa-send" @click="onSendHandle" />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { useChat } from '../../useChat.js'

const { setLoading } = useChat()

export default {
  props: {
  },
  data() {
    return {
      isIM: false,
      value: ''
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
      if (!this.value) return

      setLoading(true)
      this.$emit('send', this.value)
      this.value = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  height: 100%;
  flex-direction: column;
  .action {
    height: 44px;
    line-height: 44px;
    width: 100%;
    &>>> .el-select {
      .el-input__inner {
        height: 28px;
        line-height: 28px;
        border-radius: 16px;
        background-color: #f7f7f8;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.45);
      }
    }
  }
  .chat-input {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-top: 16px;
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
