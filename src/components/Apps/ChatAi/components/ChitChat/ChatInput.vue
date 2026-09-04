<template>
  <div
    :aria-busy="busy || transcribing || recordingPending"
    :class="[
      'chat-composer',
      {
        'is-focused': focused,
        'is-recording': recording,
        'is-dragging': dragging,
        'is-disabled': disabled || busy || transcribing || recordingPending
      }
    ]"
    @dragenter.prevent="handleDragEnter"
    @dragleave.prevent="handleDragLeave"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <div v-if="recording" class="recording-strip">
      <span class="recording-dot" />
      <span class="recording-label">
        <strong>{{ t('ChatAIRecording') }}</strong>
        <small>{{ formattedDuration }}</small>
      </span>
      <span class="waveform" aria-hidden="true">
        <i v-for="bar in 18" :key="bar" :style="{ animationDelay: `${bar * 45}ms` }" />
      </span>
      <button
        class="recording-cancel"
        type="button"
        :aria-label="t('Cancel')"
        :title="t('Cancel')"
        @click="stopRecording(false)"
      >
        <span>{{ t('Cancel') }}</span>
      </button>
      <button
        class="recording-finish"
        type="button"
        :aria-label="t('ChatAIUseRecording')"
        :title="t('ChatAIUseRecording')"
        @click="stopRecording(true)"
      >
        <el-icon><Check /></el-icon><span>{{ t('ChatAIUseRecording') }}</span>
      </button>
    </div>

    <template v-else>
      <div v-if="attachments.length" class="attachment-preview">
        <div
          v-for="attachment in attachments"
          :key="attachment.id"
          :class="['attachment-item', { 'is-file': attachment.kind === 'file' }]"
        >
          <img
            v-if="attachment.kind === 'image'"
            :alt="attachment.file.name"
            :src="attachment.url"
          />
          <span v-else class="attachment-file">
            <el-icon><Document /></el-icon>
            <span>
              <strong>{{ attachment.file.name }}</strong>
              <small>{{ formatFileSize(attachment.file.size) }}</small>
            </span>
          </span>
          <button
            :aria-label="t('ChatAIRemoveAttachment')"
            :title="t('ChatAIRemoveAttachment')"
            type="button"
            @click="removeAttachment(attachment.id)"
          >
            <el-icon><Close /></el-icon>
          </button>
        </div>
      </div>

      <textarea
        ref="textarea"
        v-model="value"
        :aria-label="t('ChatAIMessagePlaceholder')"
        :disabled="disabled || busy || transcribing || recordingPending"
        :placeholder="transcribing ? t('ChatAITranscribing') : t('ChatAIMessagePlaceholder')"
        rows="1"
        @blur="focused = false"
        @focus="focused = true"
        @input="resize"
        @keydown="handleKeydown"
        @paste="handlePaste"
      />

      <div class="composer-toolbar">
        <div class="composer-toolbar__left">
          <input
            ref="attachmentInput"
            :accept="fileAccept"
            class="attachment-input"
            multiple
            type="file"
            @change="handleAttachmentSelection"
          />
          <el-dropdown
            placement="top-start"
            popper-class="chat-ai-tool-dropdown"
            trigger="click"
            :disabled="disabled || busy || transcribing || recordingPending"
            @command="handleToolCommand"
          >
            <button
              class="composer-icon-button"
              :aria-label="t('ChatAITools')"
              :disabled="disabled || busy || transcribing || recordingPending"
              :title="t('ChatAITools')"
              type="button"
            >
              <el-icon><Plus /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :disabled="background" command="attachment">
                  <el-icon><Paperclip /></el-icon>
                  <span class="tool-menu-copy">
                    <strong>{{ t('ChatAIAttachmentInput') }}</strong>
                    <small>{{ t('ChatAIAttachmentInputHint') }}</small>
                  </span>
                </el-dropdown-item>
                <el-dropdown-item :disabled="Boolean(attachments.length)" command="background">
                  <el-icon><Clock /></el-icon>
                  <span class="tool-menu-copy">
                    <strong>{{ t('ChatAIBackgroundRun') }}</strong>
                    <small>{{ t('ChatAIBackgroundRunHint') }}</small>
                  </span>
                  <el-icon v-if="background" class="tool-menu-check"><Check /></el-icon>
                </el-dropdown-item>
                <el-dropdown-item v-if="webSearchAvailable" command="web-search">
                  <el-icon><Search /></el-icon>
                  <span class="tool-menu-copy">
                    <strong>{{ t('ChatAIWebSearch') }}</strong>
                    <small>{{ t('ChatAIWebSearchInputHint') }}</small>
                  </span>
                  <el-icon v-if="webSearch" class="tool-menu-check"><Check /></el-icon>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <button
            v-if="background"
            class="tool-mode-chip"
            :aria-label="t('ChatAIBackgroundRun')"
            :aria-pressed="true"
            :title="t('ChatAIBackgroundRun')"
            type="button"
            @click="background = false"
          >
            <el-icon><Clock /></el-icon>
            <span>{{ t('ChatAIBackgroundRun') }}</span>
            <el-icon class="tool-mode-chip__close"><Close /></el-icon>
          </button>
          <button
            v-if="webSearch"
            class="tool-mode-chip"
            :aria-label="t('ChatAIWebSearch')"
            :aria-pressed="true"
            :title="t('ChatAIWebSearch')"
            type="button"
            @click="webSearch = false"
          >
            <el-icon><Search /></el-icon>
            <span>{{ t('ChatAIWebSearch') }}</span>
            <el-icon class="tool-mode-chip__close"><Close /></el-icon>
          </button>
          <button
            class="composer-icon-button"
            :aria-label="t('ChatAIVoiceInput')"
            :disabled="disabled || busy || transcribing || recordingPending || !voiceSupported"
            :title="voiceSupported ? t('ChatAIVoiceInput') : t('ChatAIVoiceUnavailable')"
            type="button"
            @click="startRecording"
          >
            <el-icon v-if="transcribing" class="spin"><Loading /></el-icon>
            <el-icon v-else><Microphone /></el-icon>
          </button>
          <span class="input-hint">{{ t('ChatAIInputHint') }}</span>
        </div>

        <button
          v-if="busy"
          class="stop-button"
          :aria-label="stopping ? t('ChatAIStopping') : t('Stop')"
          :disabled="stopping || stopDisabled"
          type="button"
          @click="emit('stop')"
        >
          <span v-if="!stopping" class="stop-square" />
          <el-icon v-else class="spin"><Loading /></el-icon>
          {{ stopping ? t('ChatAIStopping') : t('Stop') }}
        </button>
        <button
          v-else
          class="send-button"
          :aria-label="t('Send')"
          :title="t('Send')"
          :disabled="!canSend"
          type="button"
          @click="send"
        >
          <el-icon><Promotion /></el-icon>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  Check,
  Clock,
  Close,
  Document,
  Loading,
  Microphone,
  Paperclip,
  Plus,
  Promotion,
  Search
} from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  active: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  busy: {
    type: Boolean,
    default: false
  },
  stopping: {
    type: Boolean,
    default: false
  },
  stopDisabled: {
    type: Boolean,
    default: false
  },
  transcribing: {
    type: Boolean,
    default: false
  },
  voiceTranscriptionMode: {
    type: String,
    default: 'browser'
  },
  webSearchAvailable: {
    type: Boolean,
    default: false
  },
  draftKey: {
    type: String,
    default: 'new'
  }
})

const emit = defineEmits(['send', 'stop', 'audio', 'error', 'attachment-error', 'recording-change'])
const { t } = useI18n()
const textarea = ref(null)
const attachmentInput = ref(null)
const value = ref('')
const attachments = ref([])
const webSearch = ref(false)
const background = ref(false)
const focused = ref(false)
const dragging = ref(false)
const recording = ref(false)
const recordingPending = ref(false)
const recordingSeconds = ref(0)
const browserSpeechRecognition =
  typeof window === 'undefined' ? null : window.SpeechRecognition || window.webkitSpeechRecognition
const transcriptionMode = computed(() => {
  return props.voiceTranscriptionMode === 'server' ? 'server' : 'browser'
})
const voiceSupported = computed(() => {
  if (transcriptionMode.value === 'browser') return Boolean(browserSpeechRecognition)
  return Boolean(
    typeof window !== 'undefined' && window.MediaRecorder && navigator.mediaDevices?.getUserMedia
  )
})

let recorder = null
let recognition = null
let stream = null
let chunks = []
let recordingTimer = null
let discardRecording = false
let recognizedText = ''
let dragDepth = 0
let mediaRequestId = 0
let activeDraftKey = props.draftKey
const draftStore = new Map()

const supportedImageTypes = new Set(['image/gif', 'image/jpeg', 'image/png', 'image/webp'])
const supportedFileExtensions = new Set([
  '.bash',
  '.bat',
  '.c',
  '.cc',
  '.cfg',
  '.cmd',
  '.conf',
  '.cpp',
  '.css',
  '.csv',
  '.cxx',
  '.docx',
  '.env',
  '.fish',
  '.go',
  '.h',
  '.hpp',
  '.htm',
  '.html',
  '.ini',
  '.java',
  '.js',
  '.json',
  '.jsonl',
  '.jsx',
  '.kt',
  '.kts',
  '.less',
  '.log',
  '.lua',
  '.markdown',
  '.md',
  '.mjs',
  '.pdf',
  '.php',
  '.pl',
  '.pptx',
  '.properties',
  '.ps1',
  '.py',
  '.r',
  '.rb',
  '.rs',
  '.scala',
  '.scss',
  '.sh',
  '.sql',
  '.swift',
  '.toml',
  '.ts',
  '.tsv',
  '.tsx',
  '.txt',
  '.vue',
  '.xlsx',
  '.xml',
  '.yaml',
  '.yml',
  '.zsh'
])
const fileAccept = [
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
  ...supportedFileExtensions
].join(',')

const canSend = computed(() => {
  if (background.value) {
    return Boolean(
      value.value.trim() &&
      !attachments.value.length &&
      !props.disabled &&
      !props.busy &&
      !props.transcribing &&
      !recordingPending.value
    )
  }
  return Boolean(
    (value.value.trim() || attachments.value.length) &&
    !props.disabled &&
    !props.busy &&
    !props.transcribing &&
    !recordingPending.value
  )
})
const formattedDuration = computed(() => {
  const minutes = Math.floor(recordingSeconds.value / 60)
  const seconds = recordingSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

function resize() {
  if (!textarea.value) return
  textarea.value.style.height = 'auto'
  textarea.value.style.height = `${Math.min(textarea.value.scrollHeight, 150)}px`
}

function focus() {
  nextTick(() => textarea.value?.focus())
}

function setValue(content) {
  value.value = content || ''
  nextTick(() => {
    resize()
    focus()
  })
}

function appendValue(content) {
  const text = String(content || '').trim()
  if (!text) return
  const separator = value.value.trim() ? ' ' : ''
  value.value = `${value.value}${separator}${text}`
  nextTick(() => {
    resize()
    focus()
  })
}

function clear() {
  value.value = ''
  clearAttachments()
  background.value = false
  draftStore.delete(activeDraftKey)
  nextTick(resize)
}

function send() {
  if (!canSend.value) return
  const submittedDraftKey = activeDraftKey
  const content = value.value
  const runInBackground = background.value
  const searchWeb = webSearch.value
  const images = attachments.value
    .filter((attachment) => attachment.kind === 'image')
    .map((attachment) => attachment.file)
  const files = attachments.value
    .filter((attachment) => attachment.kind === 'file')
    .map((attachment) => attachment.file)
  emit('send', content, images, {
    files,
    webSearch: searchWeb,
    background: runInBackground,
    onAccepted: () => {
      if (activeDraftKey === submittedDraftKey) clear()
      else discardDraft(submittedDraftKey)
    }
  })
}

function hasDraftContent(draft) {
  return Boolean(draft.value.trim() || draft.attachments.length || draft.background)
}

function saveDraft(key = activeDraftKey) {
  if (!key) return
  const draft = {
    value: value.value,
    attachments: [...attachments.value],
    background: background.value
  }
  if (hasDraftContent(draft)) draftStore.set(key, draft)
  else draftStore.delete(key)
}

function restoreDraft(key) {
  const draft = draftStore.get(key)
  value.value = draft?.value || ''
  attachments.value = draft?.attachments ? [...draft.attachments] : []
  background.value = Boolean(draft?.background && !attachments.value.length)
  nextTick(resize)
}

function discardDraft(key) {
  const draft = draftStore.get(key)
  for (const attachment of draft?.attachments || []) {
    if (attachment.url) URL.revokeObjectURL(attachment.url)
  }
  draftStore.delete(key)
}

watch(
  () => props.draftKey,
  (key, previousKey) => {
    saveDraft(previousKey || activeDraftKey)
    activeDraftKey = key || 'new'
    restoreDraft(activeDraftKey)
  }
)

function handleToolCommand(command) {
  if (command === 'attachment') {
    if (background.value) {
      emit('attachment-error', t('ChatAIBackgroundNoAttachments'))
      return
    }
    attachmentInput.value?.click()
    return
  }
  if (command === 'background') {
    if (attachments.value.length) {
      emit('attachment-error', t('ChatAIBackgroundNoAttachments'))
      return
    }
    background.value = !background.value
    return
  }
  if (command === 'web-search' && props.webSearchAvailable) {
    webSearch.value = !webSearch.value
  }
}

watch(
  () => props.webSearchAvailable,
  (available) => {
    if (!available) webSearch.value = false
  }
)

watch([recording, recordingPending], ([active, pending]) => {
  emit('recording-change', active || pending)
})

watch(
  () => props.active,
  (active) => {
    if (!active) {
      mediaRequestId += 1
      recordingPending.value = false
      discardRecording = true
      if (recognition) recognition.abort()
      if (recorder && recorder.state !== 'inactive') recorder.stop()
      if (recording.value) stopRecording(false)
    }
  }
)

function handleKeydown(event) {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return
  event.preventDefault()
  send()
}

function fileExtension(file) {
  const index = file.name.lastIndexOf('.')
  return index < 0 ? '' : file.name.slice(index).toLowerCase()
}

function addAttachments(files) {
  if (!props.active || props.disabled || props.busy || props.transcribing) return
  if (background.value) {
    emit('attachment-error', t('ChatAIBackgroundNoAttachments'))
    return
  }
  const candidates = Array.from(files || [])
  const images = candidates.filter((file) => file.type.startsWith('image/'))
  const documents = candidates.filter((file) => !file.type.startsWith('image/'))
  if (images.some((file) => !supportedImageTypes.has(file.type))) {
    emit('attachment-error', t('ChatAIImageTypeUnsupported'))
    return
  }
  if (documents.some((file) => !supportedFileExtensions.has(fileExtension(file)))) {
    emit('attachment-error', t('ChatAIFileTypeUnsupported'))
    return
  }
  const currentImages = attachments.value.filter((item) => item.kind === 'image')
  const currentFiles = attachments.value.filter((item) => item.kind === 'file')
  if (currentImages.length + images.length > 4) {
    emit('attachment-error', t('ChatAITooManyImages'))
    return
  }
  if (currentFiles.length + documents.length > 4) {
    emit('attachment-error', t('ChatAITooManyFiles'))
    return
  }
  if (images.some((file) => file.size > 5 * 1024 * 1024)) {
    emit('attachment-error', t('ChatAIImageTooLarge'))
    return
  }
  if (documents.some((file) => file.size > 10 * 1024 * 1024)) {
    emit('attachment-error', t('ChatAIFileTooLarge'))
    return
  }
  const imageTotalSize = [...currentImages.map((item) => item.file), ...images].reduce(
    (total, file) => total + file.size,
    0
  )
  if (imageTotalSize > 10 * 1024 * 1024) {
    emit('attachment-error', t('ChatAIImagesTooLarge'))
    return
  }
  const fileTotalSize = [...currentFiles.map((item) => item.file), ...documents].reduce(
    (total, file) => total + file.size,
    0
  )
  if (fileTotalSize > 20 * 1024 * 1024) {
    emit('attachment-error', t('ChatAIFilesTooLarge'))
    return
  }
  attachments.value.push(
    ...images.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      file,
      kind: 'image',
      url: URL.createObjectURL(file)
    })),
    ...documents.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      file,
      kind: 'file'
    }))
  )
}

function handleAttachmentSelection(event) {
  addAttachments(event.target.files)
  event.target.value = ''
}

function handlePaste(event) {
  const images = Array.from(event.clipboardData?.files || []).filter((file) => {
    return file.type.startsWith('image/')
  })
  if (!images.length) return
  event.preventDefault()
  addAttachments(images)
}

function hasDraggedFiles(dataTransfer) {
  return Array.from(dataTransfer?.types || []).includes('Files')
}

function handleDragEnter(event) {
  if (!props.active || props.disabled || props.busy || props.transcribing) return
  if (!hasDraggedFiles(event.dataTransfer)) return
  dragDepth += 1
  dragging.value = true
}

function handleDragLeave() {
  dragDepth = Math.max(0, dragDepth - 1)
  if (!dragDepth) dragging.value = false
}

function handleDrop(event) {
  dragDepth = 0
  dragging.value = false
  if (event.dataTransfer?.files?.length) addAttachments(event.dataTransfer.files)
}

function removeAttachment(id) {
  const attachment = attachments.value.find((item) => item.id === id)
  if (attachment?.url) URL.revokeObjectURL(attachment.url)
  attachments.value = attachments.value.filter((item) => item.id !== id)
}

function clearAttachments() {
  attachments.value.forEach((attachment) => {
    if (attachment.url) URL.revokeObjectURL(attachment.url)
  })
  attachments.value = []
}

function formatFileSize(size) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KiB`
  return `${(size / (1024 * 1024)).toFixed(1)} MiB`
}

function preferredMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  return types.find((type) => window.MediaRecorder.isTypeSupported(type)) || ''
}

async function startRecording() {
  if (
    !props.active ||
    props.disabled ||
    props.transcribing ||
    !voiceSupported.value ||
    recording.value ||
    recordingPending.value ||
    props.busy
  ) {
    return
  }
  if (transcriptionMode.value === 'browser') {
    startBrowserRecognition()
    return
  }
  const requestId = ++mediaRequestId
  recordingPending.value = true
  try {
    const nextStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })
    if (requestId !== mediaRequestId || !props.active) {
      nextStream.getTracks().forEach((track) => track.stop())
      return
    }
    stream = nextStream
    chunks = []
    discardRecording = false
    const mimeType = preferredMimeType()
    recorder = new window.MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    recorder.ondataavailable = (event) => {
      if (event.data?.size) chunks.push(event.data)
    }
    recorder.onstop = finishRecording
    recorder.start()
    recording.value = true
    recordingSeconds.value = 0
    recordingTimer = window.setInterval(() => recordingSeconds.value++, 1000)
  } catch (error) {
    if (requestId === mediaRequestId) {
      cleanupRecorder()
      emit('error', error)
    }
  } finally {
    if (requestId === mediaRequestId) recordingPending.value = false
  }
}

function startBrowserRecognition() {
  try {
    recognition = new browserSpeechRecognition()
    recognition.lang = navigator.language || 'zh-CN'
    recognition.continuous = true
    recognition.interimResults = false
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index]
        if (result.isFinal) recognizedText += result[0].transcript
      }
    }
    recognition.onerror = (error) => {
      if (error.error !== 'aborted') emit('error', error)
    }
    recognition.onend = () => {
      if (!discardRecording && recognizedText.trim()) {
        const separator = value.value.trim() ? ' ' : ''
        setValue(`${value.value}${separator}${recognizedText.trim()}`)
      }
      cleanupRecognition()
    }
    discardRecording = false
    recognizedText = ''
    recording.value = true
    recordingSeconds.value = 0
    recordingTimer = window.setInterval(() => recordingSeconds.value++, 1000)
    recognition.start()
  } catch (error) {
    cleanupRecognition()
    emit('error', error)
  }
}

function stopRecording(submit) {
  if (!recording.value) return
  discardRecording = !submit
  recording.value = false
  if (recordingTimer) window.clearInterval(recordingTimer)
  recordingTimer = null
  if (recognition) {
    if (submit) {
      recordingPending.value = true
      recognition.stop()
    } else recognition.abort()
    return
  }
  if (recorder && recorder.state !== 'inactive') {
    if (submit) recordingPending.value = true
    recorder.stop()
  } else cleanupRecorder()
}

function finishRecording() {
  const mimeType = recorder?.mimeType || chunks[0]?.type || 'audio/webm'
  if (!discardRecording && chunks.length) {
    const extension = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('ogg') ? 'ogg' : 'webm'
    const blob = new Blob(chunks, { type: mimeType })
    const file = new File([blob], `jumpserver-ai-${Date.now()}.${extension}`, { type: mimeType })
    emit('audio', file)
  }
  cleanupRecorder()
}

function cleanupRecorder() {
  if (recordingTimer) window.clearInterval(recordingTimer)
  recordingTimer = null
  stream?.getTracks().forEach((track) => track.stop())
  stream = null
  recorder = null
  chunks = []
  recording.value = false
  recordingPending.value = false
  recordingSeconds.value = 0
}

function cleanupRecognition() {
  if (recordingTimer) window.clearInterval(recordingTimer)
  recordingTimer = null
  recognition = null
  recording.value = false
  recordingPending.value = false
  recordingSeconds.value = 0
  recognizedText = ''
}

onBeforeUnmount(() => {
  mediaRequestId += 1
  discardRecording = true
  if (recognition) recognition.abort()
  if (recorder && recorder.state !== 'inactive') recorder.stop()
  cleanupRecognition()
  cleanupRecorder()
  saveDraft()
  const urls = new Set()
  for (const draft of draftStore.values()) {
    for (const attachment of draft.attachments || []) {
      if (attachment.url) urls.add(attachment.url)
    }
  }
  for (const attachment of attachments.value) {
    if (attachment.url) urls.add(attachment.url)
  }
  urls.forEach((url) => URL.revokeObjectURL(url))
  draftStore.clear()
  attachments.value = []
})

defineExpose({ focus, setValue, appendValue, clear, discardDraft })
</script>

<style lang="scss" scoped>
.chat-composer {
  position: relative;
  width: min(100%, 780px);
  min-height: 64px;
  margin: 0 auto;
  padding: 7px 9px 6px;
  border: 1px solid #d9dfdd;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 2px 10px rgb(31 49 43 / 5%);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;

  &.is-focused {
    border-color: var(--ai-primary, #1ab394);
    box-shadow:
      var(--ai-focus-ring, 0 0 0 3px rgb(26 179 148 / 16%)),
      0 5px 16px rgb(31 49 43 / 7%);
  }

  &.is-dragging {
    border-color: var(--ai-primary, #1ab394);
    background: var(--ai-primary-light, #e8f7f3);
    box-shadow: var(--ai-focus-ring, 0 0 0 3px rgb(26 179 148 / 16%));
  }

  &.is-disabled:not(.is-recording) {
    background: #fafbfb;
  }

  textarea {
    display: block;
    width: 100%;
    min-height: 28px;
    max-height: 130px;
    padding: 1px 3px 3px;
    overflow: auto;
    border: 0;
    outline: 0;
    color: var(--ai-text, #292827);
    background: transparent;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.55;
    resize: none;

    &::placeholder {
      color: #737b87;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }
}

.composer-toolbar {
  display: flex;
  min-height: 28px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  &__left {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 6px;
  }
}

.attachment-input {
  display: none;
}

.attachment-preview {
  display: flex;
  gap: 7px;
  padding: 0 4px 8px;
  overflow-x: auto;
}

.attachment-item {
  position: relative;
  width: 58px;
  height: 58px;
  flex: 0 0 58px;

  img {
    display: block;
    width: 100%;
    height: 100%;
    border: 1px solid #e1e4ea;
    border-radius: var(--ai-radius-sm, 8px);
    object-fit: cover;
  }

  &.is-file {
    width: 190px;
    flex-basis: 190px;
  }

  button {
    position: absolute;
    top: -5px;
    right: -5px;
    display: grid;
    width: 18px;
    height: 18px;
    padding: 0;
    place-items: center;
    border: 1px solid #fff;
    border-radius: 50%;
    color: #fff;
    background: #606675;
    cursor: pointer;
    font-size: 10px;
  }
}

.attachment-file {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 9px;
  padding: 9px 10px;
  border: 1px solid #e1e4ea;
  border-radius: var(--ai-radius-sm, 8px);
  color: #5d6475;
  background: #f8f9fb;

  > .el-icon {
    flex: 0 0 auto;
    color: var(--ai-primary-dark, #148f76);
    font-size: 24px;
  }

  > span {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 3px;
  }

  strong,
  small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    font-size: 11px;
    font-weight: 600;
  }

  small {
    color: #9298a7;
    font-size: 9px;
  }
}

.composer-icon-button {
  display: grid;
  width: 28px;
  height: 28px;
  padding: 0;
  place-items: center;
  border: 1px solid transparent;
  border-radius: var(--ai-radius-sm, 8px);
  color: #5f6878;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.18s ease;

  &:hover:not(:disabled) {
    color: var(--ai-primary-dark, #148f76);
    border-color: var(--ai-primary, #1ab394);
    background: var(--ai-primary-light, #e8f7f3);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  &:focus-visible {
    outline: 2px solid rgb(26 179 148 / 42%);
    outline-offset: 2px;
  }
}

.tool-mode-chip {
  display: inline-flex;
  height: 26px;
  align-items: center;
  gap: 5px;
  padding: 0 7px;
  border: 1px solid var(--ai-primary, #1ab394);
  border-radius: 999px;
  color: var(--ai-primary-dark, #148f76);
  background: var(--ai-primary-light, #e8f7f3);
  cursor: pointer;
  font-size: 11px;

  &__close {
    margin-left: 1px;
    color: #56796f;
    font-size: 12px;
  }
}

:global(.chat-ai-tool-dropdown) {
  z-index: 3000 !important;
  min-width: 250px;
}

:global(.chat-ai-tool-dropdown .el-dropdown-menu__item) {
  display: flex;
  min-height: 46px;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
}

:global(.chat-ai-tool-dropdown .tool-menu-copy) {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

:global(.chat-ai-tool-dropdown .tool-menu-copy strong) {
  color: #343944;
  font-size: 12px;
  font-weight: 600;
}

:global(.chat-ai-tool-dropdown .tool-menu-copy small) {
  color: #969ba6;
  font-size: 10px;
}

:global(.chat-ai-tool-dropdown .tool-menu-check) {
  color: var(--ai-primary, #1ab394);
}

.input-hint {
  overflow: hidden;
  color: #737b87;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.send-button,
.stop-button {
  display: inline-flex;
  height: 30px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
  transition: all 0.18s ease;

  &:focus-visible {
    outline: 2px solid rgb(26 179 148 / 42%);
    outline-offset: 2px;
  }
}

.send-button {
  width: 30px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--ai-primary, #1ab394);
  color: #fff;
  background: var(--ai-primary, #1ab394);

  .el-icon {
    width: 16px;
    height: 16px;
    font-size: 16px;
  }

  &:hover:not(:disabled) {
    border-color: var(--ai-primary-dark, #148f76);
    background: var(--ai-primary-dark, #148f76);
    box-shadow: 0 5px 12px rgb(20 143 118 / 20%);
    transform: translateY(-1px);
  }

  &:disabled {
    border-color: #dcdfe6;
    color: #8f959e;
    background: #f1f2f5;
    box-shadow: none;
    cursor: not-allowed;
  }
}

.stop-button {
  border: 1px solid #ead5d8;
  color: #a34f5a;
  background: #fff4f5;

  &:hover:not(:disabled) {
    background: #ffecef;
  }
}

.stop-square {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: currentColor;
}

.recording-strip {
  display: flex;
  min-height: 62px;
  align-items: center;
  gap: 10px;
  padding: 4px;
}

.recording-dot {
  width: 9px;
  height: 9px;
  flex: 0 0 9px;
  border-radius: 50%;
  background: #e55464;
  box-shadow: 0 0 0 5px rgb(229 84 100 / 10%);
  animation: record-pulse 1.2s ease-in-out infinite;
}

.recording-label {
  display: flex;
  width: 68px;
  flex-direction: column;

  strong {
    color: #5f6375;
    font-size: 10px;
  }

  small {
    margin-top: 2px;
    color: #9ba0b0;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
  }
}

.waveform {
  display: flex;
  min-width: 72px;
  height: 30px;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 2px;
  overflow: hidden;

  i {
    width: 2px;
    height: 7px;
    border-radius: 2px;
    background: var(--ai-primary, #1ab394);
    animation: waveform 0.85s ease-in-out infinite alternate;
  }
}

.recording-cancel,
.recording-finish {
  height: 30px;
  padding: 0 10px;
  border-radius: var(--ai-radius-sm, 8px);
  cursor: pointer;
  font-size: 10px;
  font-weight: 650;
}

.recording-cancel {
  border: 1px solid #e6e7ec;
  color: #7e8497;
  background: #fff;
}

.recording-finish {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--ai-primary, #1ab394);
  color: #fff;
  background: var(--ai-primary, #1ab394);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes record-pulse {
  50% {
    opacity: 0.55;
  }
}

@keyframes waveform {
  to {
    height: 25px;
    opacity: 0.55;
  }
}

@media (max-width: 560px) {
  .chat-composer {
    border-radius: var(--ai-radius-md, 10px);
  }

  .input-hint {
    display: none;
  }

  .recording-label {
    width: 54px;
  }

  .waveform i:nth-child(n + 11) {
    display: none;
  }
}

@media (max-width: 420px) {
  .recording-strip {
    gap: 7px;
  }

  .waveform {
    min-width: 22px;

    i:nth-child(n + 7) {
      display: none;
    }
  }

  .recording-cancel,
  .recording-finish {
    display: inline-grid;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    padding: 0;
    place-items: center;

    span {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
  }

  .recording-cancel::before {
    content: '×';
    font-size: 18px;
    line-height: 1;
  }
}

@media (hover: none) {
  .attachment-item button {
    top: -7px;
    right: -7px;
    width: 28px;
    height: 28px;
    font-size: 13px;
  }
}

@media (max-width: 420px) {
  .composer-toolbar__left {
    gap: 6px;
  }

  .tool-mode-chip {
    width: 32px;
    padding: 0;
    justify-content: center;

    span,
    &__close {
      display: none;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
