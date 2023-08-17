<template>
  <div style="padding: 0 20px;" @click="toggleClick">
    <svg-icon :class="{'is-active':isActive}" class="hamburger" icon-class="arrow-to-left" style="color: #ffffff;" />
  </div>
</template>

<script>
export default {
  name: 'Hamburger',
  props: {
    isActive: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    toggleClick() {
      this.$emit('toggleClick')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables";
.hamburger {
  display: inline-block;
  vertical-align: middle;
  font-size: 16px;
  color: $menuText;
}
.hamburger.is-active {
  transform: rotate(180deg);
}
</style>
