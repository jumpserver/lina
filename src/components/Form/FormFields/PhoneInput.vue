<template>
  <div :class="{ 'phone-input--number-focused': numberFocused }" class="compound-field phone-input">
    <el-select
      v-model="rawValue.code"
      :placeholder="$tc('Select')"
      class="phone-input__code"
      @change="onChange"
    >
      <el-option
        v-for="country in countries"
        :key="country.name"
        :label="country.value"
        :value="country.value"
      >
        <span class="country-name">{{ country.name }}</span>
        <span style="float: right; font-size: 13px">{{ country.value }}</span>
      </el-option>
    </el-select>
    <el-input
      v-model="rawValue.phone"
      :placeholder="$tc('InputPhone')"
      class="phone-input__number jms-input-spacing"
      required
      @blur="numberFocused = false"
      @focus="numberFocused = true"
      @input="onInputChange"
    />
  </div>
</template>

<script>
export default {
  name: 'PhoneInput',
  props: {
    value: {
      type: [Object, String],
      default: null
    }
  },
  data() {
    return {
      rawValue: {},
      numberFocused: false,
      countries: [{ name: 'China', value: '+86' }]
    }
  },
  computed: {
    fullPhone() {
      if (!this.rawValue.phone) {
        return ''
      }
      return `${this.rawValue.code}${this.rawValue.phone}`
    }
  },
  created() {
    this.rawValue = this.normalizeValue(this.value)
  },
  mounted() {
    this.rawValue = this.normalizeValue(this.value)
    this.$emit('input', this.fullPhone)
    this.$axios.get('/api/v1/common/countries/').then((res) => {
      this.countries = res.map((item) => {
        return { name: `${item.flag} ${item.name}`, value: item.phone_code }
      })
    })
  },
  methods: {
    normalizeValue(value) {
      const defaults = { code: this.getDefaultCode(), phone: '' }
      value = value && typeof value === 'object' ? value : {}
      return {
        ...defaults,
        ...value,
        code: value.code || defaults.code,
        phone: value.phone || ''
      }
    },
    getDefaultCode() {
      const mapper = {
        zh: '+86',
        en: '+1',
        ja: '+81',
        ko: '+82',
        fr: '+33',
        de: '+49',
        es: '+34',
        it: '+39',
        ru: '+7',
        ar: '+966'
      }
      const locale = this.$i18n.locale.split('-')[0]
      return localStorage.getItem('prePhoneCode') || mapper[locale] || '+86'
    },
    onChange(countryCode) {
      this.rawValue.code = countryCode
      this.onInputChange()
      localStorage.setItem('prePhoneCode', countryCode)
    },
    onInputChange() {
      this.$emit('input', this.fullPhone)
      this.$emit('change', this.fullPhone)
    }
  }
}
</script>

<style lang="scss" scoped>
/*
 * 边框方案见全局 .compound-field（element-form-controls.scss）。
 * PhoneInput 聚焦时只高亮当前号码段，不影响左侧区号段的外边框。
 */
.phone-input {
  position: relative;
}

.phone-input--number-focused {
  // Element Plus 内层会覆盖外容器的顶部边框，因此两个分段都在前景层明确描边。
  overflow: visible !important;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -1px;
    bottom: -1px;
    box-sizing: border-box;
    pointer-events: none;
  }

  // 号码输入段：四边及左侧分隔线均使用主色，避免顶部被内部 wrapper 遮住。
  &::before {
    z-index: 2;
    right: -1px;
    left: 84px;
    border: 1px solid var(--el-color-primary);
  }

  // 区号段：上、左、下保持灰色，仅右侧分隔线使用主色。
  &::after {
    z-index: 1;
    left: -1px;
    width: 86px;
    border: 1px solid var(--el-border-color);
    border-right-color: var(--el-color-primary);
  }
}

.phone-input__code {
  flex: 0 0 85px;
  width: 85px;

  :deep(.el-select__wrapper) {
    min-height: 28px;
    height: 28px;
    line-height: 28px;
    padding: 0 8px;
    background: var(--el-fill-color-light);
  }
}

.phone-input__number {
  --jms-input-padding-block: 0;
  --jms-input-padding-inline: 11px;

  flex: 1 1 auto;
  min-width: 0;

  // 覆盖 EP 的高度变量，避免内部再按默认高度撑出额外尺寸
  :deep(.el-input) {
    --el-input-height: 28px;
    height: 28px;
  }

  :deep(.el-input__wrapper) {
    min-height: 28px;
    height: 28px;
  }

  :deep(.el-input__inner) {
    height: 28px;
    line-height: 28px;
    border: 0;
  }
}

.country-name {
  display: inline-block;
  width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 5px;
}
</style>
