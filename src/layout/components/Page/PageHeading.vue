<template>
  <div class="page-heading-a">
    <div class="page-heading">
      <el-row :gutter="0" class="page-heading-top">
        <el-col :span="16" class="page-heading-left">
          <slot><h2>{{ title }}</h2></slot>
        </el-col>
        <el-col :span="8" class="page-heading-right">
          <div class="page-heading-right-actions">
            <slot name="actions" />
          </div>
        </el-col>
      </el-row>
    </div>
<!--    <Breadcrumb />-->
  </div>
</template>

<script>
// import Breadcrumb from '@/components/Breadcrumb'
export default {
  name: 'PageHeading',
  components: {
    // Breadcrumb
  },
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
  .page-heading {
    border-top: 0;
    padding: 15px 30px 15px 25px;
    background-color: #ffffff;
    min-height: 1px;
  }

  .page-heading-left, h2 {
    font-size: 18px;
    font-weight: 300;
    line-height: 1.5;
    /*margin-bottom: 12px;*/
    height: 30px;
    max-height: 32px;
  }

  .page-heading-right-actions {
    float: right;
  }

  .btn-more-actions {
    border-left: rgb(220, 223, 230) solid 1px;
  }
</style>
