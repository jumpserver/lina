<template>
  <div class="footer">
    <div class="pull-right">
      Version <strong>1.5.6-228
      </strong> GPLv2.
    </div>
    <div>
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
.footer{
    height: 100%;
    z-index: 1000;
    background: white;
    //border-top: 1px solid #e7eaec;
    div{
        font-size: 13px;
        line-height: 35px;
    }
}
</style>
