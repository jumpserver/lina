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
 * 不使用 EP 的 input-group（el-input + #prepend），因为 prepend 容器与其内部 select 各自带
 * 一条 box-shadow 边框，叠加成 border 套 border。这里改为自绘单层边框的 flex 容器，内部 select
 * 与 input 均去边框，只由容器描边，彻底消除双层。整体高度 30px、内部 28px，与表单标准一致。
 */
.phone-input {
  display: flex;
  align-items: center;
  width: 100%;
  height: 30px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color);
  background-color: #fff;

  &:hover {
    border-color: var(--el-border-color-hover);
  }

  &:focus-within {
    border-color: var(--el-color-primary);
  }
}

.phone-input__code {
  flex: 0 0 85px;
  width: 85px;

  :deep(.el-select__wrapper) {
    min-height: 28px;
    height: 28px;
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

  :deep(.el-input__wrapper) {
    min-height: 28px;
    height: 28px;
    border: 0;
    border-radius: 0;
    box-shadow: none !important;
    background: transparent;
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
