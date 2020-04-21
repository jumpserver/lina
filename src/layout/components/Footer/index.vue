<template>
  <div class="footer" :style="style">
    <div class="pull-right">
      Version <strong>1.5.6-228
      </strong> GPLv2.
    </div>
    <div style="padding-left:20px;">
      <strong>Copyright</strong> FIT2CLOUD 飞致云 © 2014-2020
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Footer',
  components: {

  },
  data() {
    return {

    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'device'
    ]),
    style() {
      if (this.device === 'mobile') {
        return ''
      }
      return this.sidebar.opened ? ('margin-left: 210px;') : ('margin-left: 54px')
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
    float: right!important;
}
.footer{
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 10px 20px;
    background: white;
    border-top: 1px solid #e7eaec;
    transition:margin-left 0.3s;
    //border-top: 1px solid #e7eaec;
    div{
        font-size: 13px;
    }
}
</style>
