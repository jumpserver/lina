<template>
  <div id="Hcard">
    <div class="head" :style="{marginBottom: `${title || btnText ? '16px': 0}`}">
      <el-row class="rows">
        <el-col :span="12" class="public-height">
          <div v-show="title" class="head-title">{{ title }}</div>
        </el-col>
        <el-col :span="12" class="public-height">
          <div class="head-right">
            <el-button
              v-show="btnText"
              type="text"
              size="mini"
              @click="btnChange"
            >
              {{ btnText }}
            </el-button>
          </div>
        </el-col>
      </el-row>
    </div>
    <slot />
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
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 2px 4px 0 rgb(54 58 80 / 32%);
    width: 100%;
    &:nth-child(n) {
      margin-bottom: 20px;
    }
    .head {
      display: flex;
      .rows {
        width: 100%;
        height: 100%;
        .head-title {
          display: inline-block;
          font-size: 14px;
          font-weight: 700;
          color: #000;
        }
        .head-right {
          text-align: right;
          &>>> .el-button--mini {
            padding: 0;
          }
        }
      }
    }
  }
  .public-height {
    min-height: .1px;
  }
</style>
