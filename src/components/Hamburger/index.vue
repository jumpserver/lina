<template>
  <div style="">
    <el-button type="primary" class="hamburger" size="mini" @click="toggleClick">
      <i class="fa fa-bars" style="color: white; margin-right: 0" />
    </el-button>
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

<style scoped>
.hamburger {
 padding: 7px 12px;
}

.hamburger.is-active {
  transform: rotate(180deg);
}

</style>
