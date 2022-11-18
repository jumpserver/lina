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

<style lang="scss" scoped>
  .page-heading {
    position: relative;
    height: 52px;
    line-height: 52px;
    background-color: #ffffff;
    .el-row {
      width: 100%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      padding-left: 24px;
    }
  }

  .page-heading-left, h2 {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    color: #1F2329;
  }

  .page-heading-right {
    float: right;
  }
</style>
