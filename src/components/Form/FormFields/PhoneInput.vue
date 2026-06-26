<template>
  <div class="phone-input">
    <el-select
      :placeholder="$tc('Select')"
      :value="rawValue.code"
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
      class="phone-input__number"
      required
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
  mounted() {
    const defaults = { code: this.getDefaultCode(), phone: '' }
    this.rawValue = this.value || defaults
    this.$axios.get('/api/v1/common/countries/').then((res) => {
      this.countries = res.map((item) => {
        return { name: `${item.flag} ${item.name}`, value: item.phone_code }
      })
    })
    this.$emit('input', this.fullPhone)
  },
  methods: {
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
    }
  }
}
</script>

<style lang="scss" scoped>
/*
 * 单层边框方案：外层 .phone-input 是唯一描边的 flex 容器；内部的 el-select 与 el-input
 * 各自会渲染带 inset box-shadow 的 __wrapper（EP 用 box-shadow 充当边框），必须把它们的
 * box-shadow / border / border-radius 全部清掉，否则就会在容器边框内再套一层，形成
 * “border 套 border”。两段之间的分隔线由 select 的 border-right 单独提供。
 * 整体高度 30px，与表单标准一致。
 */
.phone-input {
  display: flex;
  align-items: center;
  width: 100%;
  height: 30px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color);
  background-color: #fff;
  overflow: hidden;

  &:hover {
    border-color: var(--el-border-color-hover);
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
    border: 0;
    border-right: 1px solid var(--el-border-color);
    border-radius: 0;
    box-shadow: none !important;
    background: var(--el-fill-color-light);
  }
}

.phone-input__number {
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
    padding: 0 8px;
    border: 0;
    border-radius: 0;
    box-shadow: none !important;
    background: transparent;
  }

  // 激活态只作用于输入框区域：聚焦时仅这一段描边，不影响左侧 select
  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
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
