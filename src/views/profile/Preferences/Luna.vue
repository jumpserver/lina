<template>
  <Base v-bind="$data" />
</template>

<script>
import Base from './Base'
import { Select2 } from '@/components'
import { terminalThemeOptions } from '@/utils/terminal-theme'

export default {
  name: 'Luna',
  components: {
    Base
  },
  data() {
    return {
      category: 'luna',
      autoSave: true,
      canRestoreDefault: true,
      fieldsMeta: {
        command_line: {
          fieldsMeta: {
            terminal_theme_name: {
              component: Select2,
              el: {
                clearable: false,
                multiple: false,
                options: terminalThemeOptions
              }
            }
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
