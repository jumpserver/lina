<template>
  <div class="update-token">
    <el-button v-if="!isShow" icon="Edit" link @click="isShow = true">
      {{ text }}
    </el-button>
    <el-input
      v-else
      v-model.trim="curValue"
      :disabled="disabled"
      :placeholder="placeholder"
      :type="type"
      class="update-token__input"
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

  :deep(.el-input) {
    width: 100%;
  }

  :deep(.el-input-group__append) {
    padding: 0;
    border-radius: 0;
    background-color: #f5f7fa;
  }

  :deep(.el-input__wrapper) {
    border-radius: 0;
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

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  i {
    font-size: 14px;
  }
}
</style>
