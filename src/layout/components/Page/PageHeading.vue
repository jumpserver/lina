<template>
  <div>
    <slot name="globalNotification">
      <LicenseRelatedTip />
      <PasswordExpireTip />
    </slot>
    <div class="page-heading">
      <el-row :gutter="0">
        <el-col :span="16" class="page-heading-left">
          <slot><h2>{{ title }}</h2></slot>
        </el-col>
        <el-col :span="8">
          <div class="page-heading-right">
            <slot name="rightSide" />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
<!--    <Breadcrumb />-->
</template>

<script>
import LicenseRelatedTip from '@/layout/components/Page/LicenseRelatedTip'
import PasswordExpireTip from '@/layout/components/Page/PasswordExpireTip'
export default {
  name: 'PageHeading',
  components: {
    LicenseRelatedTip,
    PasswordExpireTip
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
    padding: 12px 30px 13px 25px;
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

  .page-heading-right {
    float: right;
  }
</style>
