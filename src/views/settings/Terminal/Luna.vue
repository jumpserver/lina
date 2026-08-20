<template>
  <IBox>
    <GenericCreateUpdateForm
      ref="form"
      :fields="fields"
      :fields-meta="fieldsMeta"
      :get-url="getUrl"
      :has-buttons="hasButtons"
      :has-detail-in-msg="hasDetailInMsg"
      :submit-method="submitMethod"
      @get-object-done="handleGetObjectDone"
    />
  </IBox>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import IBox from '@/components/Common/IBox'
import { Select2 } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'
import { terminalThemeOptions } from '@/utils/terminal-theme'

export default {
  name: 'LunaSetting',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    const fields = [
      [
        this.$t('Basic'),
        [
          'LUNA_DEFAULT_IS_ASYNC_ASSET_TREE',
          'LUNA_DEFAULT_CONNECT_DEFAULT_OPEN_METHOD',
          'LUNA_DEFAULT_THEMES'
        ]
      ],
      [
        this.$t('Graphics'),
        [
          'LUNA_DEFAULT_RDP_RESOLUTION',
          'LUNA_DEFAULT_KEYBOARD_LAYOUT',
          'LUNA_DEFAULT_RDP_CLIENT_OPTION',
          'LUNA_DEFAULT_RDP_COLOR_QUALITY',
          'LUNA_DEFAULT_RDP_SMART_SIZE',
          'LUNA_DEFAULT_APPLET_CONNECTION_METHOD',
          'LUNA_DEFAULT_FILE_NAME_CONFLICT_RESOLUTION'
        ]
      ],
      [
        this.$t('CommandLine'),
        [
          'LUNA_DEFAULT_CHARACTER_TERMINAL_FONT_SIZE',
          'LUNA_DEFAULT_IS_BACKSPACE_AS_CTRL_H',
          'LUNA_DEFAULT_IS_RIGHT_CLICK_QUICKLY_PASTE',
          'LUNA_DEFAULT_TERMINAL_THEME_NAME'
        ]
      ]
    ]
    const fieldsMeta = {}
    fields
      .flatMap(([, fieldNames]) => fieldNames)
      .forEach((fieldName) => {
        fieldsMeta[fieldName] = {
          on: {
            change: ([value], updateForm) => {
              this.queueSettingSave(fieldName, value, updateForm)
            }
          }
        }
      })
    fieldsMeta.LUNA_DEFAULT_TERMINAL_THEME_NAME = {
      ...fieldsMeta.LUNA_DEFAULT_TERMINAL_THEME_NAME,
      component: Select2,
      el: {
        clearable: false,
        multiple: false,
        options: terminalThemeOptions
      }
    }

    return {
      fields,
      fieldsMeta,
      getUrl: () => '/api/v1/settings/setting/?category=luna',
      hasButtons: false,
      hasDetailInMsg: false,
      submitMethod() {
        return 'patch'
      },
      savedSettingValues: {},
      autoSaveQueues: {},
      autoSaveVersions: {}
    }
  },
  methods: {
    handleGetObjectDone(values) {
      this.savedSettingValues = cloneDeep(values)
    },
    nextAutoSaveVersion(fieldName) {
      const version = (this.autoSaveVersions[fieldName] || 0) + 1
      this.autoSaveVersions[fieldName] = version
      return version
    },
    enqueueAutoSave(fieldName, task) {
      const previous = this.autoSaveQueues[fieldName] || Promise.resolve()
      const current = previous.catch(() => {}).then(task)
      this.autoSaveQueues[fieldName] = current
      current.finally(() => {
        if (this.autoSaveQueues[fieldName] === current) {
          delete this.autoSaveQueues[fieldName]
        }
      })
      return current
    },
    queueSettingSave(fieldName, value, updateForm) {
      const nextValue = cloneDeep(value)
      const version = this.nextAutoSaveVersion(fieldName)

      return this.enqueueAutoSave(fieldName, async () => {
        const previousValue = cloneDeep(this.savedSettingValues[fieldName])
        if (isEqual(previousValue, nextValue)) {
          return
        }
        try {
          await this.$axios.patch(this.getUrl(), { [fieldName]: nextValue })
          this.savedSettingValues[fieldName] = cloneDeep(nextValue)
          if (this.autoSaveVersions[fieldName] === version) {
            this.$message.success(this.$t('SaveSuccess'))
          }
        } catch (error) {
          if (this.autoSaveVersions[fieldName] === version) {
            updateForm?.({ [fieldName]: previousValue })
          }
        }
      })
    }
  }
}
</script>

<style scoped></style>
