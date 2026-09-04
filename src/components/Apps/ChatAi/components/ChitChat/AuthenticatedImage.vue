<template>
  <img
    ref="element"
    :alt="attachment.name || ''"
    :class="{ 'is-loading': loading, 'is-unavailable': unavailable }"
    :src="source || undefined"
  />
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { fetchChatAIArtifact } from '@/api/chatAi'

const props = defineProps({
  attachment: {
    type: Object,
    required: true
  }
})

const element = ref(null)
const source = ref('')
const loading = ref(false)
const unavailable = ref(false)
let observer = null
let controller = null
let ownedObjectUrl = ''
let mounted = false
let loadVersion = 0

function releaseObjectUrl() {
  if (ownedObjectUrl) URL.revokeObjectURL(ownedObjectUrl)
  ownedObjectUrl = ''
}

function disconnect() {
  observer?.disconnect()
  observer = null
  controller?.abort()
  controller = null
}

async function load() {
  if (loading.value || source.value || !props.attachment.id) return
  const version = loadVersion
  loading.value = true
  unavailable.value = false
  const requestController = new AbortController()
  controller = requestController
  try {
    const file = await fetchChatAIArtifact(props.attachment, { signal: requestController.signal })
    if (requestController.signal.aborted || version !== loadVersion) return
    ownedObjectUrl = URL.createObjectURL(file)
    source.value = ownedObjectUrl
  } catch (error) {
    if (version === loadVersion && error?.name !== 'AbortError') unavailable.value = true
  } finally {
    if (version === loadVersion) loading.value = false
    if (controller === requestController) controller = null
  }
}

function observe() {
  loadVersion += 1
  disconnect()
  releaseObjectUrl()
  source.value = ''
  loading.value = false
  unavailable.value = false

  const directUrl = props.attachment.local ? props.attachment.url : ''
  if (directUrl) {
    source.value = directUrl
    return
  }
  if (!props.attachment.id) {
    unavailable.value = true
    return
  }
  if (typeof IntersectionObserver === 'undefined') {
    load()
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer?.disconnect()
      observer = null
      load()
    },
    { rootMargin: '160px' }
  )
  if (element.value) observer.observe(element.value)
}

watch(
  () => [props.attachment.id, props.attachment.url, props.attachment.local],
  () => {
    if (mounted) observe()
  }
)

onMounted(() => {
  mounted = true
  observe()
})

onBeforeUnmount(() => {
  mounted = false
  loadVersion += 1
  disconnect()
  releaseObjectUrl()
})
</script>

<style scoped>
img {
  aspect-ratio: 4 / 3;
  background: #f2f4f6;
}

img.is-loading,
img.is-unavailable {
  color: #8a919e;
}
</style>
