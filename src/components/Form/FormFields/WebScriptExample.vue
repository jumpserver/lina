<template>
  <details class="web-script-example">
    <summary>{{ $t('WebScriptExampleTitle') }}</summary>
    <p>{{ $t('WebScriptExampleHelp') }}</p>
    <el-button text type="primary" native-type="button" @click="copy(example)">
      <el-icon><CopyDocument /></el-icon>
      {{ $t('Copy') }}
    </el-button>
    <pre><code>{{ example }}</code></pre>
  </details>
</template>

<script>
import { copy } from '@/utils/common/index'

const example = JSON.stringify(
  [
    { step: 1, command: 'type', target: 'id=username', value: '{USERNAME}' },
    { step: 2, command: 'type', target: 'id=password', value: '{SECRET}' },
    { step: 3, command: 'click', target: 'id=login_button' },
    { step: 4, command: 'interactive', target: 'css=#mfa-dialog', optional: false },
    { step: 5, command: 'success', target: 'css=#dashboard' }
  ],
  null,
  2
)

export default {
  name: 'WebScriptExample',
  data() {
    return { example }
  },
  methods: { copy }
}
</script>

<style lang="scss" scoped>
.web-script-example {
  min-width: 0;

  summary {
    color: var(--color-link);
    cursor: pointer;
  }

  p {
    margin: 8px 0;
  }

  pre {
    max-height: 360px;
    margin: 8px 0 0;
    padding: 12px;
    overflow: auto;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
    line-height: 1.5;
  }
}
</style>
