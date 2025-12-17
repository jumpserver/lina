<template>
  <div class="footer" :class="device" :style="style">
    <div class="pull-right version">
      Version <strong> dev </strong> <span v-if="!publicSettings.XPACK_LICENSE_IS_VALID"> GPLv3. </span>
    </div>
    <div>{{ corporation }}</div>
  </div>
</template>
<script lang="jsx">
import { mapGetters } from 'vuex'
export default {
  name: 'Footer',
  data() {
    return {
      curYear: this.$moment().year() || ''
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'device',
      'publicSettings'
    ]),
    style() {
      if (this.device === 'mobile') {
        return ''
      }
      return this.sidebar.opened ? ('margin-left: 200px;') : ('margin-left: 54px')
    },
    corporation() {
      return this.publicSettings.XPACK_LICENSE_INFO.corporation
    }
  }
}
</script>
<style lang="less">
.el-footer{
    padding: 0;
    height: 35px !important;
}
.pull-right {
    float: right
}
.footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 0 24px;
    background: white;
    border-top: 1px solid #e7eaec;
    transition:margin-left 0.3s;
    height: 48px;
    line-height: 48px;
    div{
        font-size: 13px;
    }
}
.mobile.footer {
  text-align: center;
}
.mobile.footer .pull-right{
  float: none;
  display: block;
}
</style>
