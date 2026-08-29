<template>
  <div class="otp-secret-input">
    <el-input
      v-model.trim="curValue"
      :disabled="disabled"
      :placeholder="placeholder"
      @input="handleInput"
    >
      <template slot="append">
        <el-button
          :disabled="disabled"
          :loading="loading"
          type="text"
          @click="generateOTPSecret"
        >
          {{ $t('Generate') }}
        </el-button>
      </template>
    </el-input>
    <div v-if="generatedOTPCode" class="otp-secret-input__code">
      <span class="otp-secret-input__code-label">{{ $t('CurrentOTPCode') }}:</span>
      <span class="otp-secret-input__code-value">{{ generatedOTPCode }}</span>
      <el-button type="text" @click="copyOTPCode">
        {{ $t('Copy') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { copy } from '@/utils/common/index'

export default {
  name: 'OTPSecretInput',
  props: {
    value: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      curValue: this.value,
      generatedOTPCode: ''
    }
  },
  watch: {
    value(val) {
      this.curValue = val
    }
  },
  methods: {
    handleInput(value) {
      this.generatedOTPCode = ''
      this.$emit('input', value)
    },
    async generateOTPSecret() {
      this.loading = true
      try {
        const data = await this.$axios.post('/api/v1/accounts/accounts/generate-otp/')
        this.curValue = data.otp_secret_key || ''
        this.generatedOTPCode = data.otp_code || ''
        this.$emit('input', this.curValue)
      } finally {
        this.loading = false
      }
    },
    copyOTPCode() {
      if (!this.generatedOTPCode) {
        return
      }
      copy(this.generatedOTPCode)
      this.$message.success(this.$tc('CopySuccess'))
    }
  }
}
</script>

<style lang="scss" scoped>
.otp-secret-input {
  &__code {
    margin-top: 8px;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 1.4;
  }

  &__code-label {
    white-space: nowrap;
  }

  &__code-value {
    color: var(--color-text-primary);
    font-family: monospace;
    letter-spacing: 1px;
  }
}
</style>
