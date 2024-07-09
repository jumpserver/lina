<template>
  <div>
    <el-input v-model="rawValue.phone" :placeholder="$tc('InputPhone')" required @input="onInputChange">
      <el-select
        slot="prepend"
        :placeholder="$tc('Select')"
        :value="rawValue.code"
        style="width: 105px;"
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
    const defaults = { code: localStorage.getItem('prePhoneCode') || '+86', phone: '' }
    this.rawValue = this.value || defaults
    this.$axios.get('/api/v1/common/countries/').then(res => {
      this.countries = res.map(item => {
        return { name: `${item.flag} ${item.name}`, value: item.phone_code }
      })
    })
    this.$emit('input', this.fullPhone)
  },
  methods: {
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

<style scoped>
.country-name {
  display: inline-block;
  width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 5px;
}
</style>
