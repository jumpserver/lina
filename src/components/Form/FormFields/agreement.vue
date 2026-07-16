<template>
  <div :class="{ highlight: highlightBody }">
    <el-checkbox v-model="iValue">
      {{ $t('ReadAgreeTo') }}
    </el-checkbox>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    highlightBody() {
      if (
        this.$route.query._to?.includes('dashboard') ||
        this.$route.query._to?.includes('workbench')
      ) {
        return false
      } else {
        return true
      }
    },
    iValue: {
      get() {
        return this.value
      },
      set(v) {
        this.$emit('update:value', v)
        this.$emit('input', v)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.highlight {
  color: var(--color-danger);
  border: 2px solid var(--color-danger);
  padding: 10px;
}
</style>
