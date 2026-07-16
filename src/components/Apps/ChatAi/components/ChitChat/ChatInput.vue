<template>
  <div :class="['chat-composer', { 'is-focused': focused, 'is-recording': recording }]">
    <div v-if="recording" class="recording-strip">
      <span class="recording-dot" />
      <span class="recording-label">
        <strong>{{ t('ChatAIRecording') }}</strong>
        <small>{{ formattedDuration }}</small>
      </span>
      <span class="waveform" aria-hidden="true">
        <i v-for="bar in 18" :key="bar" :style="{ animationDelay: `${bar * 45}ms` }" />
      </span>
      <button class="recording-cancel" type="button" @click="stopRecording(false)">
        {{ t('Cancel') }}
      </button>
      <button class="recording-finish" type="button" @click="stopRecording(true)">
        <el-icon><Check /></el-icon> {{ t('ChatAIUseRecording') }}
      </button>
    </div>

    <template v-else>
      <div v-if="attachments.length" class="attachment-preview">
        <div v-for="attachment in attachments" :key="attachment.id" class="attachment-item">
          <img :alt="attachment.file.name" :src="attachment.url" />
          <button
            :aria-label="t('ChatAIRemoveImage')"
            :title="t('ChatAIRemoveImage')"
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
        :disabled="disabled || transcribing"
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
            ref="imageInput"
            accept="image/gif,image/jpeg,image/png,image/webp"
            class="image-input"
            multiple
            type="file"
            @change="handleImageSelection"
          />
          <button
            class="composer-icon-button"
            :aria-label="t('ChatAIImageInput')"
            :disabled="disabled || busy || transcribing"
            :title="t('ChatAIImageInput')"
            type="button"
            @click="imageInput?.click()"
          >
            <el-icon><Picture /></el-icon>
          </button>
          <button
            class="composer-icon-button"
            :aria-label="t('ChatAIVoiceInput')"
            :disabled="disabled || transcribing || !voiceSupported"
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
          :disabled="stopping"
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
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { Check, Close, Loading, Microphone, Picture, Promotion } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
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
  transcribing: {
    type: Boolean,
    default: false
  },
  voiceTranscriptionMode: {
    type: String,
    default: 'browser'
  }
})

const emit = defineEmits(['send', 'stop', 'audio', 'error', 'image-error'])
const { t } = useI18n()
const textarea = ref(null)
const imageInput = ref(null)
const value = ref('')
const attachments = ref([])
const focused = ref(false)
const recording = ref(false)
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

const canSend = computed(() => {
  return Boolean(
    (value.value.trim() || attachments.value.length) &&
    !props.disabled &&
    !props.busy &&
    !props.transcribing
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

function clear() {
  value.value = ''
  clearAttachments()
  nextTick(resize)
}

function send() {
  if (!canSend.value) return
  const content = value.value
  const images = attachments.value.map((attachment) => attachment.file)
  clear()
  emit('send', content, images)
}

function handleKeydown(event) {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return
  event.preventDefault()
  send()
}

function addImages(files) {
  const supportedTypes = new Set(['image/gif', 'image/jpeg', 'image/png', 'image/webp'])
  const candidates = Array.from(files || [])
  if (candidates.some((file) => !supportedTypes.has(file.type))) {
    emit('image-error', t('ChatAIImageTypeUnsupported'))
    return
  }
  if (attachments.value.length + candidates.length > 4) {
    emit('image-error', t('ChatAITooManyImages'))
    return
  }
  if (candidates.some((file) => file.size > 5 * 1024 * 1024)) {
    emit('image-error', t('ChatAIImageTooLarge'))
    return
  }
  const totalSize = [...attachments.value.map((item) => item.file), ...candidates].reduce(
    (total, file) => total + file.size,
    0
  )
  if (totalSize > 10 * 1024 * 1024) {
    emit('image-error', t('ChatAIImagesTooLarge'))
    return
  }
  attachments.value.push(
    ...candidates.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      file,
      url: URL.createObjectURL(file)
    }))
  )
}

function handleImageSelection(event) {
  addImages(event.target.files)
  event.target.value = ''
}

function handlePaste(event) {
  const images = Array.from(event.clipboardData?.files || []).filter((file) => {
    return file.type.startsWith('image/')
  })
  if (!images.length) return
  event.preventDefault()
  addImages(images)
}

function removeAttachment(id) {
  const attachment = attachments.value.find((item) => item.id === id)
  if (attachment) URL.revokeObjectURL(attachment.url)
  attachments.value = attachments.value.filter((item) => item.id !== id)
}

function clearAttachments() {
  attachments.value.forEach((attachment) => URL.revokeObjectURL(attachment.url))
  attachments.value = []
}

function preferredMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  return types.find((type) => window.MediaRecorder.isTypeSupported(type)) || ''
}

async function startRecording() {
  if (!voiceSupported.value || recording.value) return
  if (transcriptionMode.value === 'browser') {
    startBrowserRecognition()
    return
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })
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
    cleanupRecorder()
    emit('error', error)
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
    if (submit) recognition.stop()
    else recognition.abort()
    return
  }
  if (recorder && recorder.state !== 'inactive') recorder.stop()
  else cleanupRecorder()
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
  recordingSeconds.value = 0
}

function cleanupRecognition() {
  if (recordingTimer) window.clearInterval(recordingTimer)
  recordingTimer = null
  recognition = null
  recording.value = false
  recordingSeconds.value = 0
  recognizedText = ''
}

onBeforeUnmount(() => {
  discardRecording = true
  if (recognition) recognition.abort()
  if (recorder && recorder.state !== 'inactive') recorder.stop()
  cleanupRecognition()
  cleanupRecorder()
  clearAttachments()
})

defineExpose({ focus, setValue, clear })
</script>

<style lang="scss" scoped>
.chat-composer {
  position: relative;
  width: min(100%, 780px);
  min-height: 80px;
  margin: 0 auto;
  padding: 11px 12px 9px;
  border: 1px solid var(--color-input-border, #bbbfc4);
  border-radius: 4px;
  background: #fff;
  transition: all 0.22s ease;

  &.is-focused {
    border-color: var(--ai-primary, #1ab394);
    box-shadow: 0 0 0 2px var(--ai-primary-light-2, #d1efe8);
  }

  textarea {
    display: block;
    width: 100%;
    min-height: 34px;
    max-height: 150px;
    padding: 1px 4px 5px;
    overflow: auto;
    border: 0;
    outline: 0;
    color: var(--ai-text, #292827);
    background: transparent;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.6;
    resize: none;

    &::placeholder {
      color: #8f959e;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }
}

.composer-toolbar {
  display: flex;
  min-height: 32px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  &__left {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 8px;
  }
}

.image-input {
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
  width: 64px;
  height: 64px;
  flex: 0 0 64px;

  img {
    display: block;
    width: 100%;
    height: 100%;
    border: 1px solid #e1e4ea;
    border-radius: 5px;
    object-fit: cover;
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

.composer-icon-button {
  display: grid;
  width: 30px;
  height: 30px;
  padding: 0;
  place-items: center;
  border: 1px solid #e9eaf0;
  border-radius: 4px;
  color: #747b91;
  background: #fafafd;
  cursor: pointer;
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
}

.input-hint {
  overflow: hidden;
  color: #8f959e;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.send-button,
.stop-button {
  display: inline-flex;
  height: 32px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
  transition: all 0.18s ease;
}

.send-button {
  width: 32px;
  padding: 0;
  border: 1px solid var(--ai-primary, #1ab394);
  color: #fff;
  background: var(--ai-primary, #1ab394);

  &:hover:not(:disabled) {
    border-color: var(--ai-primary-dark, #148f76);
    background: var(--ai-primary-dark, #148f76);
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
  min-height: 70px;
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
  height: 31px;
  padding: 0 10px;
  border-radius: 4px;
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
    border-radius: 4px;
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

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
