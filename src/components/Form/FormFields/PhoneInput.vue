<template>
  <div>
    <el-input v-model="rawValue.phone" :placeholder="$tc('InputPhone')" @input="OnInputChange">
      <el-select
        slot="prepend"
        :placeholder="$tc('Select')"
        :value="rawValue.code"
        style="width: 90px;"
        @change="OnChange"
      >
        <el-option
          v-for="country in countries"
          :key="country.value"
          :label="country.value"
          :value="country.value"
          style="width: 200px;"
        >
          <span style="float: left">{{ country.name }}</span>
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
      default: () => ({ 'code': '+86', 'phone': '' })
    }
  },
  data() {
    return {
      rawValue: {},
      countries: [
        { name: 'China(中国)', value: '+86' },
        { name: 'HongKong(中国香港)', value: '+852' },
        { name: 'Macao(中国澳门)', value: '+853' },
        { name: 'Taiwan(中国台湾)', value: '+886' },
        { name: 'America(America)', value: '+1' },
        { name: 'Russia(Россия)', value: '+7' },
        { name: 'France(français)', value: '+33' },
        { name: 'Britain(Britain)', value: '+44' },
        { name: 'Germany(Deutschland)', value: '+49' },
        { name: 'Japan(日本)', value: '+81' },
        { name: 'Korea(한국)', value: '+82' },
        { name: 'India(भारत)', value: '+91' }
      ]
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
    this.rawValue = this.value || { code: '+86', phone: '' }
    this.$emit('input', this.fullPhone)
  },
  methods: {
    OnChange(countryCode) {
      this.rawValue.code = countryCode
      this.OnInputChange()
    },
    OnInputChange() {
      this.$emit('input', this.fullPhone)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
