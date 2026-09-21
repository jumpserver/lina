<template>
  <div class="command-rule-editor">
    <div v-if="aiAvailable" class="command-rule-editor__toolbar">
      <span>{{ $t('CommandRuleAIEntryHint') }}</span>
      <el-button plain size="small" type="primary" @click="openGenerator">
        <el-icon><MagicStick /></el-icon>
        {{ $t('CommandRuleAIAction') }}
      </el-button>
    </div>

    <el-input
      :disabled="disabled"
      :model-value="currentValue"
      :placeholder="placeholder"
      :rows="rows"
      type="textarea"
      @change="emitChange"
      @input="emitValue"
      @update:model-value="emitValue"
    />

    <p v-if="draftApplied" aria-live="polite" class="command-rule-editor__applied">
      <el-icon><CircleCheck /></el-icon>
      {{ $t('CommandRuleAIApplied') }}
    </p>

    <Dialog
      v-model:visible="dialogVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      :title="$t('CommandRuleAIDialogTitle')"
      class="command-rule-ai-dialog"
      width="720px"
      @closed="cancelGeneration"
    >
      <div class="command-rule-ai-dialog__body" :aria-busy="generating">
        <el-alert :closable="false" :title="$t('CommandRuleAIReviewHint')" show-icon type="info" />

        <el-form label-position="top" @submit.prevent>
          <el-form-item :label="$t('CommandRuleAIGoal')" required>
            <el-input
              v-model="request.goal"
              :disabled="generating"
              :maxlength="1000"
              :placeholder="$t('CommandRuleAIGoalPlaceholder')"
              :rows="4"
              resize="vertical"
              show-word-limit
              type="textarea"
            />
          </el-form-item>

          <div class="command-rule-ai-dialog__options">
            <el-form-item :label="$t('CommandMatchMode')">
              <CommandMatchMode v-model="request.type" :disabled="generating" />
            </el-form-item>
            <el-form-item :label="$t('IgnoreCase')">
              <el-switch v-model="request.ignoreCase" :disabled="generating" />
            </el-form-item>
          </div>

          <div class="command-rule-ai-dialog__examples">
            <el-form-item :label="$t('CommandRuleAIMatchExamples')">
              <el-input
                v-model="request.matchExamples"
                :disabled="generating"
                :maxlength="4000"
                :placeholder="$t('CommandRuleAIMatchExamplesPlaceholder')"
                :rows="3"
                resize="vertical"
                type="textarea"
              />
            </el-form-item>
            <el-form-item :label="$t('CommandRuleAIExcludeExamples')">
              <el-input
                v-model="request.excludeExamples"
                :disabled="generating"
                :maxlength="4000"
                :placeholder="$t('CommandRuleAIExcludeExamplesPlaceholder')"
                :rows="3"
                resize="vertical"
                type="textarea"
              />
            </el-form-item>
          </div>
        </el-form>

        <section
          v-if="generating"
          aria-live="polite"
          class="command-rule-ai-dialog__loading"
          role="status"
        >
          <el-icon class="is-loading"><Loading /></el-icon>
          <div>
            <strong>{{ $t('CommandRuleAIGenerating') }}</strong>
            <span>{{ $t('CommandRuleAIGeneratingHint') }}</span>
          </div>
        </section>

        <el-alert
          v-if="errorMessage"
          :closable="false"
          :title="errorMessage"
          class="command-rule-ai-dialog__error"
          show-icon
          type="error"
        />

        <section v-if="draft" class="command-rule-ai-dialog__preview" aria-live="polite">
          <div class="command-rule-ai-dialog__preview-heading">
            <strong>{{ $t('CommandRuleAIPreview') }}</strong>
            <span>{{ draft.type === 'regex' ? $t('Regex') : $t('Command') }}</span>
          </div>
          <el-input
            v-model="draft.content"
            :aria-label="$t('CommandRuleAIPreview')"
            :disabled="generating"
            :rows="7"
            resize="vertical"
            type="textarea"
          />
          <p v-if="draft.explanation" class="command-rule-ai-dialog__explanation">
            {{ draft.explanation }}
          </p>
        </section>
      </div>

      <template #footer>
        <el-button @click="closeDialog">{{ $t('Cancel') }}</el-button>
        <el-button
          :disabled="!canGenerate"
          :loading="generating"
          :type="draft ? '' : 'primary'"
          @click="generateDraft"
        >
          {{ draft ? $t('Retry') : $t('Generate') }}
        </el-button>
        <el-button
          v-if="draft"
          :disabled="generating || !draft.content.trim()"
          type="primary"
          @click="applyDraft"
        >
          {{ $t('CommandRuleAIApply') }}
        </el-button>
      </template>
    </Dialog>
  </div>
</template>

<script>
import { inject } from 'vue'
import store from '@/store'
import Dialog from '@/components/Dialog/index.vue'
import { FORM_RENDERER_KEY } from '@/components/Form/DataForm/components/el-form-renderer/context'
import { generateCommandGroupDraft } from '@/api/commandFilterAI'
import CommandMatchMode from './CommandMatchMode.vue'

function emptyRequest() {
  return {
    goal: '',
    matchExamples: '',
    excludeExamples: '',
    type: 'command',
    ignoreCase: true
  }
}

function isAbortError(error) {
  return (
    error?.name === 'AbortError' ||
    error?.name === 'CanceledError' ||
    error?.code === 'ERR_CANCELED'
  )
}

export default {
  name: 'CommandRuleEditor',
  components: { CommandMatchMode, Dialog },
  props: {
    value: {
      type: String,
      default: ''
    },
    modelValue: {
      type: String,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    rows: {
      type: Number,
      default: 6
    }
  },
  emits: ['input', 'change', 'update:modelValue', 'update:model-value'],
  setup() {
    const formRendererContext = inject(FORM_RENDERER_KEY, {
      updateForm: null,
      getFormValue: null
    })
    return { formRendererContext }
  },
  data() {
    return {
      dialogVisible: false,
      generating: false,
      draftApplied: false,
      draft: null,
      errorMessage: '',
      request: emptyRequest(),
      generationController: null
    }
  },
  computed: {
    currentValue() {
      return this.modelValue ?? this.value ?? ''
    },
    aiAvailable() {
      const settings = store.getters.publicSettings || {}
      const method = String(settings.CHAT_AI_METHOD || '').toLowerCase()
      return (
        !this.disabled &&
        settings.CHAT_AI_ENABLED === true &&
        !['embed', 'iframe'].includes(method) &&
        this.$hasPerm('chat_ai.use_chatai')
      )
    },
    canGenerate() {
      return !this.generating && this.request.goal.trim().length > 0
    }
  },
  beforeUnmount() {
    this.cancelGeneration()
  },
  methods: {
    emitValue(value) {
      this.draftApplied = false
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
      this.$emit('update:model-value', value)
    },
    emitChange(value) {
      this.$emit('change', value)
    },
    openGenerator() {
      const formValue = this.formRendererContext.getFormValue?.() || {}
      this.request = {
        ...emptyRequest(),
        type: ['command', 'regex'].includes(formValue.type) ? formValue.type : 'command',
        ignoreCase: formValue.ignore_case !== false
      }
      this.draft = null
      this.errorMessage = ''
      this.dialogVisible = true
    },
    closeDialog() {
      this.cancelGeneration()
      this.dialogVisible = false
    },
    cancelGeneration() {
      this.generationController?.abort()
      this.generationController = null
      this.generating = false
    },
    async generateDraft() {
      if (!this.canGenerate) return
      this.cancelGeneration()
      const controller = new AbortController()
      this.generationController = controller
      this.generating = true
      this.errorMessage = ''
      try {
        this.draft = await generateCommandGroupDraft(
          { ...this.request, locale: this.$i18n.locale },
          { signal: controller.signal }
        )
      } catch (error) {
        if (!isAbortError(error)) {
          this.errorMessage = this.$t('CommandRuleAIError')
        }
      } finally {
        if (this.generationController === controller) {
          this.generationController = null
          this.generating = false
        }
      }
    },
    applyDraft() {
      if (!this.draft?.content.trim()) return
      const content = this.draft.content.trim()
      this.formRendererContext.updateForm?.({
        type: this.draft.type,
        ignore_case: this.draft.ignore_case,
        content
      })
      if (!this.formRendererContext.updateForm) this.emitValue(content)
      this.draftApplied = true
      this.dialogVisible = false
      this.$message.success(this.$t('CommandRuleAIApplied'))
    }
  }
}
</script>

<style lang="scss" scoped>
.command-rule-editor {
  width: 100%;
  min-width: 0;
}

.command-rule-editor__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;

  span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  :deep(.el-button) {
    flex: 0 0 auto;
    margin: 0;
  }

  :deep(.el-icon) {
    margin-inline-end: 4px;
  }
}

.command-rule-editor__applied {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 6px 0 0;
  color: var(--el-color-success);
  font-size: 12px;
  line-height: 1.5;
}

.command-rule-ai-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.command-rule-ai-dialog__body :deep(.el-form) {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.command-rule-ai-dialog__body :deep(.el-form-item) {
  margin: 0;
}

.command-rule-ai-dialog__options,
.command-rule-ai-dialog__examples {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.command-rule-ai-dialog__options :deep(.el-form-item__content) {
  min-height: 32px;
  display: flex;
  align-items: center;
}

.command-rule-ai-dialog__error {
  margin: 0;
}

.command-rule-ai-dialog__loading {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
  padding: 14px;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);

  > .el-icon {
    flex: 0 0 auto;
    margin-top: 2px;
    font-size: 18px;
  }

  > div {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  strong,
  span {
    overflow-wrap: anywhere;
  }

  strong {
    line-height: 1.5;
  }

  span {
    color: var(--color-text-secondary);
    font-size: 12px;
    line-height: 1.6;
  }
}

.command-rule-ai-dialog__preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-fill-color-lighter);
}

.command-rule-ai-dialog__preview-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--color-text-primary);
  line-height: 1.5;

  span {
    color: var(--color-text-secondary);
    font-size: 12px;
  }
}

.command-rule-ai-dialog__explanation {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

@media (max-width: 680px) {
  .command-rule-editor__toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .command-rule-ai-dialog__options,
  .command-rule-ai-dialog__examples {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
