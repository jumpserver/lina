<template>
  <div>
    <slot name="globalNotification">
      <SqlQueryTip v-if="debug" />
      <LicenseRelatedTip v-else />
      <PasswordExpireTip />
    </slot>
    <div class="page-heading">
      <el-row :gutter="0" type="flex">
        <el-col :span="16" class="page-heading-left">
          <slot
            ><h2>{{ title }}</h2></slot
          >
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
import { IS_DEV } from '@/utils/env'

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
      debug: IS_DEV
    }
  },
  computed: {
    ...mapGetters(['inDrawer'])
  }
}
</script>

<style lang="scss" scoped>
.page-heading {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 50px;
  background-color: var(--page-background-color, #fff);
  border-bottom: 1px solid var(--panel-border-color, var(--el-border-color));

  .el-row {
    width: 100%;
    min-width: 0;
    padding: 0 var(--page-inline-padding, 20px);

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
