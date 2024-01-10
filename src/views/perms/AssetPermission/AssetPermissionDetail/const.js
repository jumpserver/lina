import i18n from '@/i18n/i18n'

export const ALL = 'all'
export const CONNECT = 'connect'
export const UPLOAD_FILE = 'upload_file'
export const DOWNLOAD_FILE = 'download_file'
export const UNDOWNLOAD = 'updownload'
export const CLIPBOARD_COPY = 'clipboard_copy'
export const CLIPBOARD_PASTE = 'clipboard_paste'
export const CLIPBOARD_COPY_PASTE = 'clipboard_copy_paste'

export const ACTIONS_FIELDS_MAP = {
  [ALL]: {
    name: ALL,
    action: i18n.t('all')
  },
  [CONNECT]: {
    name: CONNECT,
    action: i18n.t('connect')
  },
  [UPLOAD_FILE]: {
    name: UPLOAD_FILE,
    action: i18n.t('uploadFile')
  },
  [DOWNLOAD_FILE]: {
    name: DOWNLOAD_FILE,
    action: i18n.t('downloadFile')
  },
  [UNDOWNLOAD]: {
    name: UNDOWNLOAD,
    action: i18n.t('upDownload')
  },
  [CLIPBOARD_COPY]: {
    name: CLIPBOARD_COPY,
    action: i18n.t('clipboardCopy')
  },
  [CLIPBOARD_PASTE]: {
    name: CLIPBOARD_PASTE,
    action: i18n.t('clipboardPaste')
  },
  [CLIPBOARD_COPY_PASTE]: {
    name: CLIPBOARD_COPY_PASTE,
    action: i18n.t('clipboardCopyPaste')
  }
}

