<template>
  <div>
    <slot name="globalNotification">
      <SqlQueryTip v-if="debug " />
      <LicenseRelatedTip v-else />
      <PasswordExpireTip />
    </slot>
    <div class="page-heading">
      <el-row :gutter="0" type="flex">
        <el-col :span="16" class="page-heading-left">
          <slot><h2>{{ title }}</h2></slot>
        </el-col>
        <el-col :span="8" class="page-heading-right">
          <slot name="rightSide" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import LicenseRelatedTip from './LicenseRelatedTip'
import PasswordExpireTip from './PasswordExpireTip'
import SqlQueryTip from './SqlQueryTip'
import { mapGetters } from 'vuex'

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
  },
  computed: {
    ...mapGetters(['inDrawer'])
  }
}
</script>

<style lang="scss" scoped>
$origin-color: #ffffff;

.page-heading {
  display: flex;
  align-items: center;
  height: 50px;
  background-color: $origin-color;
  border-bottom: 1px solid rgba(31, 35, 41, .15);

  .el-row {
    width: 100%;
    padding: 0 24px;

    .page-heading-left,
    h2 {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
      color: var(--color-text-primary);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .page-heading-right {
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
