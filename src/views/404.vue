<template>
  <div class="error-404-container">
    <div class="error-404-text">
      <h1 class="error-404-title">404 请求错误</h1>
      <p class="error-404-subtitle">无法访问当前页面</p>
      <a href="/ui/" class="el-button el-button--success error-button">去往首页</a>
    </div>
    <div class="error-404-image-container">
      <img class="error-404-error-image" src="@/assets/img/robot.png" alt="page error">
    </div>
  </div>
</template>

<script>

export default {
  name: 'Page404',
  computed: {
    message() {
      return 'The webmaster said that you can not enter this page...'
    }
  }
}
</script>

<style lang="scss" scoped>
  .error-404-container {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    margin-top: 180px;
  }

  .error-404-text {
    -webkit-box-align: start;
    -ms-flex-align: start;
    align-items: flex-start;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    min-width: 384px;
  }

  .error-404-title {
    font-size: 40px;
    font-weight: 600;
    font-synthesis: style;
  }

  .error-404-subtitle {
    font-size: 18px;
    margin-top: 10px;
    color: #646464;
    line-height: 1.4;
  }

  .error-button {
    margin-top: 20px;
  }

  a {
    color: white !important;
  }
</style>
