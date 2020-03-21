<template>
  <div class="footer">
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

export default {
  name: 'Footer',
  components: {

  },
  data() {
    return {

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
    margin-left: 190px;
    //border-top: 1px solid #e7eaec;
    div{
        font-size: 13px;
    }
}
</style>
