<template>
  <div>
    <el-input v-model="rawValue.phone" :placeholder="$tc('users.inputPhone')" @input="OnInputChange">
      <el-select
        slot="prepend"
        :value="rawValue.code"
        :placeholder="$tc('common.Select')"
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
import { mapGetters } from 'vuex'

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
      rawValue: {}
    }
  },
  computed: {
    fullPhone() {
      if (!this.rawValue.phone) {
        return ''
      }
      return `${this.rawValue.code}${this.rawValue.phone}`
    },
    countries: {
      get() {
        return this.publicSettings.COUNTRY_CALLING_CODES
      }
    },
    ...mapGetters(['publicSettings'])
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
