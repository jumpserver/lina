<template>
  <div class="backplayground">
    <slot />
  </div>
</template>

<script>
export default {

}
</script>

<style lang="less" scoped>
.backplayground{
    height: 100%;
    background-color: #ffffff;
    margin-left:0.5%;
    margin-right:0.5%;
    margin-top:1%;
    margin-bottom:1%;
}
</style>
