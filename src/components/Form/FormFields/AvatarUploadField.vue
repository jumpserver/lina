<template>
  <div class="avatar-upload-field">
    <el-upload
      ref="upload"
      :accept="accept"
      :auto-upload="false"
      :disabled="disabled"
      :on-change="selectFile"
      :show-file-list="false"
      :title="$t('SelectFile')"
    >
      <span class="avatar-upload-field__label">{{ $t('SelectFile') }}</span>
      <img v-if="preview" :src="preview" alt="" />
      <el-icon v-else><Plus /></el-icon>
    </el-upload>
    <el-button v-if="hasSelectedFile" :disabled="disabled" link @click="image = previousImage">
      {{ $t('Cancel') }}
    </el-button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

defineOptions({ inheritAttrs: false })
const props = defineProps({
  accept: { type: String, default: 'image/jpg, image/png, image/jpeg, image/svg+xml' },
  disabled: Boolean,
  size: { type: Number, default: 56 }
})

const image = defineModel({ type: [String, File] })
const upload = ref(null)
const preview = ref('')
const previousImage = ref('')
const hasSelectedFile = computed(() => image.value instanceof File)
const uploadSize = computed(() => `${props.size}px`)

watch(
  image,
  (value, previousValue, onCleanup) => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value)
      preview.value = url
      onCleanup(() => URL.revokeObjectURL(url))
    } else {
      previousImage.value = value
      preview.value = value
    }
  },
  { immediate: true }
)

function selectFile({ raw }) {
  upload.value.clearFiles()
  image.value = raw
}
</script>

<style scoped>
.avatar-upload-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-upload-field :deep(.el-upload) {
  position: relative;
  width: v-bind(uploadSize);
  height: v-bind(uploadSize);
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  box-sizing: border-box;
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-size: 20px;
  transition: border-color var(--el-transition-duration-fast);
}

.avatar-upload-field :deep(.el-upload:not(.is-disabled):is(:hover, :focus-visible)) {
  border-color: var(--el-color-primary);
}

.avatar-upload-field img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.avatar-upload-field__label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>
