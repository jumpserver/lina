<template>
  <div class="page-heading-shell">
    <div class="page-heading-notification">
      <slot name="globalNotification">
        <LicenseRelatedTip v-if="!debug" />
        <PasswordExpireTip />
      </slot>
    </div>
    <div v-if="showDebugContext" class="page-heading-context-row">
      <SqlQueryTip />
    </div>
    <div class="page-heading">
      <div class="page-heading-main">
        <div class="page-heading-left">
          <slot><h2>{{ title }}</h2></slot>
        </div>
        <div class="page-heading-right">
          <slot name="rightSide" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
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
  },
  computed: {
    ...mapGetters(['inDrawer', 'showSqlQueryCounter', 'sqlQueryCounter']),
    showDebugContext() {
      return this.debug && this.showSqlQueryCounter && (this.sqlQueryCounter || []).length > 0
    }
  }
}
</script>

<style lang="scss" scoped>
.page-heading-shell {
  display: flex;
  flex-direction: column;
  background-color: var(--surface-panel);
}

.page-heading-notification {
  flex: 0 0 auto;
  overflow: hidden;
}

.page-heading-context-row {
  display: flex;
  align-items: center;
  min-height: 38px;
  background-color: var(--N100);
  border-bottom: 1px solid var(--N200);
}

.page-heading-context-row :deep(.sql-debug-tip) {
  width: 100%;
}

.page-heading {
  flex: 0 0 auto;
  min-height: 48px;
  background-color: var(--surface-panel);
  border-bottom: 1px solid var(--N200);
}

.page-heading-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: 48px;
  padding: 0 var(--space-4);
}

.page-heading-left,
.page-heading-left :deep(h2) {
  display: flex;
  align-items: center;
  min-width: 0;
  font-size: 16px;
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.page-heading-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
  min-width: fit-content;
}

@media (max-width: 992px) {
  .page-heading-shell {
    padding: 0 var(--space-4);
  }

  .page-heading-main {
    flex-wrap: wrap;
    padding-top: var(--space-2);
    padding-bottom: var(--space-2);
  }

  .page-heading-left,
  .page-heading-right {
    width: 100%;
  }

  .page-heading-right {
    justify-content: flex-start;
  }
}
</style>
