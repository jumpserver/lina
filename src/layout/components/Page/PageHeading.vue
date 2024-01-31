<template>
  <div>
    <slot name="globalNotification">
      <SqlQueryTip v-if="debug" />
      <LicenseRelatedTip v-else />
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
</template>

<script>
import LicenseRelatedTip from './LicenseRelatedTip'
import PasswordExpireTip from './PasswordExpireTip'
import SqlQueryTip from './SqlQueryTip'

export default {
  name: 'PageHeading',
  components: {
    LicenseRelatedTip,
    PasswordExpireTip,
    SqlQueryTip
  },
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      debug: process.env.NODE_ENV === 'development'
    }
  }
}
</script>

<style lang="scss" scoped>
  .page-heading {
    position: relative;
    height: 50px;
    line-height: 50px;
    background-color: #ffffff;
    .el-row {
      width: 100%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      padding: 0 24px;
    }
  }

  .page-heading-left, h2 {
    font-size: 16px;
    font-weight: 500;
    line-height: 32px;
    color: #1F2329;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .page-heading-right {
    float: right;
  }
</style>
