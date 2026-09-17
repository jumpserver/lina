<script setup>
import { computed, h, onActivated, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox, ElTooltip } from 'element-plus'
import { Dialog, ListTable } from '@/components'
import request from '@/utils/request'
import { formatFileSize, getErrorResponseMsg } from '@/utils/common'
import { hasPermission } from '@/utils/jms/permission'
import { message } from '@/utils/vue/message'

const props = defineProps({ object: { type: Object, required: true } })
const { t } = useI18n()
const images = shallowRef([])
const maxSize = shallowRef(0)
const loading = shallowRef(false)
const error = shallowRef('')
const deleting = shallowRef(false)
const dialogVisible = shallowRef(false)
const files = shallowRef([])
const uploading = shallowRef(false)
const uploadError = shallowRef('')
const loaded = shallowRef(0)
const total = shallowRef(0)
let loadController
let uploadController

const canView = computed(() => hasPermission('terminal.view_virtualapp'))
const canChange = computed(() => hasPermission('terminal.change_virtualapp'))
const url = computed(() => `/api/v1/terminal/virtual-apps/${props.object.id}/images/`)
const headerActions = computed(() => ({
  hasSearch: false,
  hasCreate: canChange.value,
  canCreate: !loading.value && !uploading.value && !deleting.value && maxSize.value > 0,
  createTitle: t('Upload'),
  onCreate: openUpload,
  hasMoreActions: canChange.value,
  hasBulkDelete: canChange.value,
  canBulkDelete: !loading.value && !uploading.value && !deleting.value,
  performBulkDelete: deleteImages,
  hasImport: false,
  hasExport: false,
  hasColumnSetting: false,
  hasRefresh: false,
  extraRightSideActions: [
    {
      name: 'actionRefresh',
      icon: 'refresh',
      tip: t('Refresh'),
      can: !loading.value && !uploading.value && !deleting.value,
      callback: loadImages
    }
  ]
}))
const imageRows = computed(() =>
  images.value.map((image) => ({
    ...image,
    id: image.architecture,
    outdated: image.version !== props.object.version || image.image_name !== props.object.image_name
  }))
)
const tableConfig = computed(() => {
  const columns = [
    { prop: 'filename', label: t('Filename') },
    { prop: 'image_name', label: t('ImageName') },
    {
      prop: 'architecture',
      label: t('Platform'),
      formatter: (row) => `${row.os}/${row.architecture}`
    },
    {
      prop: 'version',
      label: t('Version'),
      formatter: (row) =>
        row.outdated
          ? h(
              ElTooltip,
              { content: t('OfflineImageOutdatedHelp') },
              {
                default: () =>
                  h(
                    'span',
                    { class: 'image-version-mismatch' },
                    `${row.version} (${t('NotMatch')})`
                  )
              }
            )
          : row.version
    },
    {
      prop: 'size',
      label: t('OfflineImageSize'),
      formatter: (row) => formatFileSize(row.size)
    },
    {
      prop: 'actions',
      has: canChange.value,
      formatterArgs: {
        hasUpdate: false,
        hasClone: false,
        hasDelete: true,
        canDelete: () => canChange.value && !loading.value && !uploading.value && !deleting.value,
        onDelete: ({ row }) => deleteImage(row)
      }
    }
  ]
  return {
    url: url.value,
    totalData: imageRows.value,
    columns: columns.map((column) => column.prop),
    columnsMeta: Object.fromEntries(columns.map((column) => [column.prop, column])),
    hasPagination: false,
    hasSelection: canChange.value,
    canSelect: () => !loading.value && !uploading.value && !deleting.value,
    hasEdit: false,
    hasDelete: false,
    tableAttrs: { rowKey: 'id', emptyText: t('OfflineImageEmpty') }
  }
})
const file = computed(() => files.value[0]?.raw)
const progress = computed(() =>
  total.value ? Math.min(100, Math.floor((loaded.value / total.value) * 100)) : 0
)
const validating = computed(() => total.value > 0 && loaded.value >= total.value)

function setImages(data) {
  images.value = data.images
  maxSize.value = data.max_size
}

async function loadImages() {
  if (!props.object.id || !canView.value) return
  loadController?.abort()
  const controller = new AbortController()
  loadController = controller
  loading.value = true
  error.value = ''
  try {
    const data = await request.get(url.value, {
      signal: controller.signal,
      disableFlashErrorMsg: true
    })
    if (!controller.signal.aborted) setImages(data)
  } catch (err) {
    if (err.code !== 'ERR_CANCELED') error.value = getErrorResponseMsg(err)
  } finally {
    if (loadController === controller) loading.value = false
  }
}

function openUpload() {
  files.value = []
  uploadError.value = ''
  loaded.value = 0
  total.value = 0
  dialogVisible.value = true
}

function validateFile() {
  uploadError.value = ''
  if (!file.value) return false
  if (!/\.(tar|tar\.zst|zst)$/i.test(file.value.name)) {
    uploadError.value = t('OfflineImageFormatError')
  } else if (file.value.size > maxSize.value) {
    uploadError.value = t('OfflineImageSizeError', { size: formatFileSize(maxSize.value) })
  }
  return !uploadError.value
}

async function uploadImage() {
  if (uploading.value || !canChange.value || !validateFile()) return
  uploading.value = true
  loaded.value = 0
  total.value = 0
  const form = new FormData()
  form.append('file', file.value)
  uploadController = new AbortController()
  try {
    const data = await request.post(url.value, form, {
      timeout: 60 * 60 * 1000,
      signal: uploadController.signal,
      disableFlashErrorMsg: true,
      onUploadProgress: (event) => {
        loaded.value = event.loaded
        total.value = event.total || 0
      }
    })
    setImages(data)
    dialogVisible.value = false
    message.success(t('UploadSucceed'))
  } catch (err) {
    if (err.code === 'ERR_CANCELED') {
      uploadError.value = t('OfflineImageUploadCancelled')
    } else if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      uploadError.value = t('OfflineImageUploadTimeout')
    } else if (!err.response) {
      uploadError.value = t('OfflineImageUploadNetworkError')
    } else if (err.response.status === 413) {
      uploadError.value = t('UploadFileTooLarge')
    } else {
      uploadError.value = getErrorResponseMsg(err)
    }
  } finally {
    uploading.value = false
    uploadController = null
  }
}

function cancelUpload() {
  if (uploading.value) uploadController?.abort()
  else dialogVisible.value = false
}

async function deleteImage(image) {
  if (deleting.value || !canChange.value) return
  try {
    await ElMessageBox.confirm(
      t('OfflineImageDeleteConfirm', { filename: image.filename }),
      t('Confirm'),
      { type: 'warning', confirmButtonText: t('Delete'), cancelButtonText: t('Cancel') }
    )
  } catch {
    return
  }
  try {
    await deleteImages([image])
    message.success(t('DeleteSuccess'))
  } catch (err) {
    error.value = getErrorResponseMsg(err)
  }
}

async function deleteImages(selectedRows) {
  const imageUrl = url.value
  const targets = selectedRows.filter((row) =>
    images.value.some((image) => image.architecture === row.architecture)
  )
  deleting.value = true
  error.value = ''
  try {
    for (const image of targets) {
      setImages(
        await request.delete(imageUrl, {
          params: { architecture: image.architecture },
          disableFlashErrorMsg: true
        })
      )
    }
  } finally {
    deleting.value = false
  }
}

watch(() => [props.object.id, canView.value], loadImages, { immediate: true })
onActivated(() => {
  if (!loading.value && !uploading.value && !deleting.value) loadImages()
})
onBeforeUnmount(() => {
  loadController?.abort()
  uploadController?.abort()
})
</script>

<template>
  <div v-if="canView" class="offline-images">
    <el-alert :title="t('OfflineImagePublishHelp')" type="info" :closable="false" />
    <el-alert v-if="error" :title="error" type="error" :closable="false" />
    <ListTable
      v-loading="loading"
      :header-actions="headerActions"
      :table-config="tableConfig"
      activation-refresh="never"
    />
    <Dialog
      v-model:visible="dialogVisible"
      :title="t('OfflineImageUpload')"
      :close-on-click-modal="!uploading"
      :close-on-press-escape="!uploading"
      :show-close="!uploading"
      :destroy-on-close="true"
    >
      <p class="image-reference">{{ t('ImageName') }}: {{ object.image_name }}</p>
      <p>{{ t('Version') }}: {{ object.version }}</p>
      <el-upload
        v-model:file-list="files"
        :auto-upload="false"
        :limit="1"
        :disabled="uploading"
        :on-change="validateFile"
        accept=".tar,.tar.zst,.zst"
        action=""
        drag
        class="image-upload"
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">{{ t('DragUploadFileInfo') }}</div>
        <template #tip>
          <div class="el-upload__tip">
            {{ t('OfflineImageUploadHelp', { size: formatFileSize(maxSize) }) }}
          </div>
        </template>
      </el-upload>
      <div v-if="uploading" class="upload-progress" role="status" aria-live="polite">
        <el-progress :percentage="progress" />
        <span>{{ t(validating ? 'OfflineImageValidating' : 'Uploading') }}</span>
        <span v-if="total"> · {{ formatFileSize(loaded) }} / {{ formatFileSize(total) }}</span>
      </div>
      <el-alert v-if="uploadError" :title="uploadError" type="error" :closable="false" />
      <template #footer>
        <el-button @click="cancelUpload">{{ t('Cancel') }}</el-button>
        <el-button
          type="primary"
          :loading="uploading"
          :disabled="!file || !canChange"
          @click="uploadImage"
        >
          {{ t('Upload') }}
        </el-button>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.offline-images {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.offline-images :deep(.image-version-mismatch) {
  color: var(--el-color-warning);
}

.image-reference {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.image-upload :deep(.el-upload) {
  width: 100%;
}

.upload-progress {
  margin: 16px 0;
}
</style>
