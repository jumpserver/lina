import { onActivated, onBeforeUnmount, onDeactivated, onMounted, ref } from 'vue'

// Several lists can share a page wrapper (including during a route transition).
// Release its layout only after the last active list has left.
const layoutOwners = new WeakMap()

function acquireLayout(element, layout) {
  const owners = layoutOwners.get(element) || 0
  if (!owners) {
    // A separate attribute survives Vue updates to the host's class binding.
    element.dataset.listLayout = layout
  }
  layoutOwners.set(element, owners + 1)
  return () => {
    const remaining = layoutOwners.get(element) - 1
    if (remaining) {
      layoutOwners.set(element, remaining)
    } else {
      layoutOwners.delete(element)
      delete element.dataset.listLayout
    }
  }
}

export function useListTableViewport() {
  const listRoot = ref(null)
  const fillHeight = ref(false)
  let releaseLayout = []
  function activate() {
    // Mounted/activated hooks already have the attached DOM. Restore its sizing
    // before the table's next layout pass, rather than painting an unbounded list.
    if (releaseLayout.length || !listRoot.value) {
      return
    }

    const path = [listRoot.value]
    let parent = listRoot.value.parentElement
    while (parent && !parent.matches('.page-content, .tab-page-content')) {
      // Embedded lists keep their host's sizing, including existing asset dialogs.
      if (parent.matches('.el-card, .el-form, .el-table, .el-dialog, .list-table')) {
        return
      }
      path.push(parent)
      parent = parent.parentElement
    }
    if (!parent) {
      return
    }

    releaseLayout = path.map((element) => acquireLayout(element, 'container'))
    releaseLayout.push(acquireLayout(parent, 'viewport'))
    fillHeight.value = true
  }

  function deactivate() {
    releaseLayout.forEach((release) => release())
    releaseLayout = []
    // KeepAlive retains the table: do not switch it back to content height while
    // hidden, which forces another table layout when the page is shown again.
  }

  onMounted(activate)
  onActivated(activate)
  onDeactivated(deactivate)
  onBeforeUnmount(deactivate)

  return { listRoot, fillHeight }
}
