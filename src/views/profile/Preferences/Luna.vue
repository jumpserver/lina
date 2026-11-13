<template>
  <Base v-bind="$data" />
</template>

<script>
import Base from './Base'
import { Select2 } from '@/components'
import { terminalThemeOptions } from '@/utils/terminal-theme'

const sections = {
  graphics: {
    fieldsInclude: ['graphics'],
    fieldsExclude: ['graphics.file_name_conflict_resolution']
  },
  commandLine: {
    fieldsInclude: ['command_line']
  }
}

export default {
  name: 'Luna',
  components: {
    Base
  },
  props: {
    section: {
      type: String,
      required: true,
      validator: (value) => Object.hasOwn(sections, value)
    }
  },
  data() {
    return {
      categories: ['luna'],
      ...sections[this.section],
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
