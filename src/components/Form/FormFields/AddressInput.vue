<template>
  <div class="address-input-wrapper">
    <el-input
      :value="value"
      @input="onInput"
      @blur="onBlur"
    >
      <i
        v-if="detectedType"
        slot="suffix"
        :class="suffixIcon"
        :style="{ color: suffixColor }"
        class="address-suffix-icon"
      />
    </el-input>
    <div
      v-if="detectedType"
      :class="['address-hint-text', 'hint-' + detectedType]"
    >
      {{ hintText }}
    </div>
  </div>
</template>

<script>
import { detectAddressType } from '@/utils/addressType'

export default {
  name: 'AddressInput',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      detectedType: ''
    }
  },
  computed: {
    suffixIcon() {
      if (this.detectedType === 'unknown') return 'el-icon-warning-outline'
      return 'el-icon-circle-check'
    },
    suffixColor() {
      if (this.detectedType === 'unknown') return '#E6A23C'
      return '#67C23A'
    },
    hintText() {
      const hints = {
        ipv4: this.$t('FormatIPV4'),
        ipv6: this.$t('FormatIPV6'),
        url: this.$t('FormatURL'),
        domain: this.$t('FormatDomain'),
        unknown: this.$t('FormatUnknownWarning')
      }
      return hints[this.detectedType] || ''
    }
  },
  methods: {
    onInput(val) {
      this.detectedType = ''
      this.$emit('input', val)
    },
    onBlur() {
      this.detectedType = detectAddressType(this.value || '')
    }
  }
}
</script>

<style scoped>
.address-input-wrapper {
  width: 100%;
}
.address-suffix-icon {
  display: flex;
  align-items: center;
  height: 100%;
  font-size: 16px;
}
.address-hint-text {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: #909399;
}
.address-hint-text.hint-unknown {
  color: #E6A23C;
}
</style>
