<template>
  <div class="update-token" :class="{ 'compound-field': isShow }">
    <el-button v-if="!isShow" icon="Edit" link @click="isShow = true">
      {{ text }}
    </el-button>
    <el-input
      v-else
      v-model.trim="curValue"
      :disabled="disabled"
      :placeholder="placeholder"
      :type="type"
      autocomplete="new-password"
      class="update-token__input jms-input-spacing"
      show-password
      @change="onChange"
    >
      <template #append>
        <button
          :disabled="disabled"
          class="update-token__refresh"
          type="button"
          @click="randomPassword"
        >
          <i class="fa fa-refresh" />
        </button>
      </template>
    </el-input>
  </div>
</template>

<script>
import { randomString } from '@/utils/common/index'

export default {
  props: {
    value: {
      type: String,
      default: () => ''
    },
    type: {
      type: String,
      default: () => 'password'
    },
    text: {
      type: String,
      default() {
        return 'Update'
      }
    },
    showInput: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: () => ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShow: this.showInput,
      curValue: this.value
    }
  },
  created() {
    if (this.$route.path.indexOf('/update') !== -1) {
      this.isShow = false
    }
  },
  methods: {
    onChange(e) {
      this.$emit('input', this.curValue)
    },
    randomPassword() {
      this.curValue = randomString(24, true)
      this.$emit('input', this.curValue)
    }
  }
}
</script>
<style lang="scss" scoped>
.update-token {
  display: flex;
  align-items: center;
  width: 100%;

  // 展开输入态:整控件做成单边框容器(compound-field 约定,与 PhoneInput 同一套)。
  // 容器出唯一一圈边框,内部 input wrapper 与 append 全部去边、融为一体,
  // 避免 EP input-group 各段自带边框叠成「右侧一个独立灰按钮」。
  &.compound-field {
    height: 30px;
    box-sizing: border-box;
    border: 1px solid var(--el-border-color);
    border-radius: 0;
    background-color: #fff;
    overflow: hidden;

    &:hover {
      border-color: var(--el-border-color-hover);
    }

    // 聚焦时高亮整圈容器边框(而非某一段),刷新图标本身不产生高亮
    &:focus-within {
      border-color: var(--el-color-primary);
    }
  }

  :deep(.el-input) {
    width: 100%;
    height: 100%;
  }

  // 内部输入框 wrapper 去边、去 box-shadow:边框统一由容器提供
  :deep(.el-input__wrapper) {
    border: 0 !important;
    border-radius: 0;
    box-shadow: none !important;
  }

  // append(刷新按钮)去边、透明,与输入框无缝融为一体
  :deep(.el-input-group__append) {
    padding: 0 2px;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    background-color: transparent;
  }
}

.update-token__input {
  flex: 1 1 auto;
  min-width: 0;
}

.update-token__refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 28px;
  padding: 0;
  border: 0;
  background-color: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  outline: none; // 去掉原生 button 点击后的 focus 描边,图标本身不产生高亮

  &:focus,
  &:focus-visible {
    outline: none;
  }

  &:hover {
    color: var(--color-primary);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  i {
    font-size: 14px;
  }
}
</style>
