import i18n from '@/i18n/i18n'

export const ALL = 'All'
export const CONNECT = 'Connect'
export const UPLOAD_FILE = 'Upload'
export const DOWNLOAD_FILE = 'Download'
export const UNDOWNLOAD = 'UpDownload'
export const CLIPBOARD_COPY = 'Copy'
export const CLIPBOARD_PASTE = 'Paste'
export const CLIPBOARD_COPY_PASTE = 'Clipboard'

export const ACTIONS_FIELDS_MAP = {
  [ALL]: {
    name: ALL,
    action: i18n.t('All')
  },
  [CONNECT]: {
    name: CONNECT,
    action: i18n.t('Connect')
  },
  [UPLOAD_FILE]: {
    name: UPLOAD_FILE,
    action: i18n.t('Upload')
  },
  [DOWNLOAD_FILE]: {
    name: DOWNLOAD_FILE,
    action: i18n.t('Download')
  },
  [UNDOWNLOAD]: {
    name: UNDOWNLOAD,
    action: i18n.t('UpDownload')
  },
  [CLIPBOARD_COPY]: {
    name: CLIPBOARD_COPY,
    action: i18n.t('Copy')
  },
  [CLIPBOARD_PASTE]: {
    name: CLIPBOARD_PASTE,
    action: i18n.t('Paste')
  },
  [CLIPBOARD_COPY_PASTE]: {
    name: CLIPBOARD_COPY_PASTE,
    action: i18n.t('Clipboard')
  }
}

