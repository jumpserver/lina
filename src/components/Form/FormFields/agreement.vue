<template>
  <div>
    <el-checkbox v-model="iValue">
      {{ $t('ReadAgreeTo') }}
      <a href="/core/auth/agreement/" target="_blank" style="color: #409eff">
        {{ $t('TermsOfService') }}
      </a>
      {{ $t('and') }}
      <a href="/core/auth/privacy/" target="_blank" style="color: #409eff">
        {{ $t('PrivacyPolicy') }}
      </a>
    </el-checkbox>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      iValue: false
    }
  },
  watch: {
    iValue: {
      handler(v) {
        this.$emit('input', v)
      }
    }
  },
  created() {
    this.iValue = this.value
  },
  computed: {
    iValue: {
      get() {
        return this.value
      },
      set(v) {
        this.$emit('update:value', v)
      }
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped></style>
