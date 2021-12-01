<template>
  <div id="Hcard">
    <el-card class="box-card">
      <div v-if="title || btnText" slot="header" class="clearfix">
        <span v-show="title" class="head-title">{{ title }}</span>
        <el-button
          v-show="btnText"
          style="float: right; padding: 3px 0"
          type="text"
          @click="btnChange"
        >
          {{ btnText }}
        </el-button>
      </div>
      <slot />
    </el-card>

  </div>
</template>

<script>
export default {
  name: 'Hcard',
  props: {
    title: {
      type: String,
      default: () => ''
    },
    btnText: {
      type: String,
      default: () => ''
    },
    btnRouteName: {
      type: String,
      default: () => ''
    },
    showNumber: {
      type: String,
      default: () => ''
    }
  },
  methods: {
    btnChange() {
      if (this.btnRouteName) {
        this.$router.push({ name: this.btnRouteName })
      }
    }
  }
}
</script>

<style  lang="scss" scoped>
  #Hcard {
    width: 100%;
    background-color: #fff;
    box-shadow: 0 2px 4px 0 rgb(54 58 80 / 32%);
    transition: all 0.4s ease;
    overflow: hidden;
    &>>> .el-card__header {
      padding: 20px 20px 0;
      border-bottom: 0;
    }
    &:hover {
      box-shadow: 0 4px 5px 0 rgb(54 58 80 / 42%);
    }
    &:nth-child(n) {
      margin-bottom: 20px;
    }
    .head-title {
      display: inline-block;
      font-size: 14px;
      font-weight: 500;
      color: #000;
    }
  }
  .public-height {
    min-height: .1px;
  }
</style>
