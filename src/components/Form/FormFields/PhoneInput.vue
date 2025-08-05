<template>
  <div>
    <el-input v-model="rawValue.phone" :placeholder="$tc('InputPhone')" required @input="onInputChange">
      <el-select
        slot="prepend"
        :placeholder="$tc('Select')"
        :value="rawValue.code"
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
    </el-input>
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
      countries: [{ 'name': 'China', 'value': '+86' }]
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
    this.$axios.get('/api/v1/common/countries/').then(res => {
      this.countries = res.map(item => {
        return { name: `${item.flag} ${item.name}`, value: item.phone_code }
      })
    })
    this.$emit('input', this.fullPhone)
  },
  methods: {
    getDefaultCode() {
      const mapper = {
        'zh': '+86',
        'en': '+1',
        'ja': '+81',
        'ko': '+82',
        'fr': '+33',
        'de': '+49',
        'es': '+34',
        'it': '+39',
        'ru': '+7',
        'ar': '+966'
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
.el-select {
  width: 85px;
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
