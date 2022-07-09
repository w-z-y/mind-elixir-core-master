import { cloneDeep } from 'lodash'
/* 增加 shift 组合键操作 */
export default function(mind) {
  const key2func = {
    13: () => {
      // enter
      mind.insertSibling()
    },
    9: (e) => {
      // tab
      if (e.shiftKey) {
        mind.insertParent()
      } else {
        mind.addChild()
      }
    },
    113: () => {
      // f2
      mind.beginEdit()
    },
    38: () => {
      // up
      mind.selectPrevSibling()
    },
    40: () => {
      // down
      mind.selectNextSibling()
    },
    37: () => {
      // left
      if (!mind.currentNode) return
      if (mind.currentNode.offsetParent.offsetParent.className === 'rhs') {
        mind.selectParent()
      } else if (
        mind.currentNode.offsetParent.offsetParent.className === 'lhs' ||
        mind.currentNode.nodeObj.root
      ) {
        mind.selectFirstChild()
      }
    },
    39: () => {
      // right
      if (!mind.currentNode) return
      if (
        mind.currentNode.offsetParent.offsetParent.className === 'rhs' ||
        mind.currentNode.nodeObj.root
      ) {
        mind.selectFirstChild()
      } else if (
        mind.currentNode.offsetParent.offsetParent.className === 'lhs'
      ) {
        mind.selectParent()
      }
    },
    33() {
      // pageUp
      mind.moveUpNode()
    },
    34() {
      // pageDown
      mind.moveDownNode()
    },
    67(e) {
      if (e.metaKey || e.ctrlKey) {
      // ctrl c
        mind.waitCopy = mind.currentNode.cloneNode()
        mind.currentNode.nodeObj.root = false
        mind.waitCopy.nodeObj = cloneDeep(mind.currentNode.nodeObj)
      }
    },
    86(e) {
      if (!mind.waitCopy) return
      if (e.metaKey || e.ctrlKey) {
      // ctrl v
        mind.copyNode(mind.waitCopy, mind.currentNode)
        // mind.waitCopy = null
      }
    },
    88(e) {
      if (e.metaKey || e.ctrlKey) {
        // ctrl x
        mind.waitCopy = mind.currentNode.cloneNode()
        mind.currentNode.nodeObj.root = false
        mind.waitCopy.nodeObj = cloneDeep(mind.currentNode.nodeObj)
        if (mind.currentLink) mind.removeLink()
        else mind.removeNode()
      }
    },
    // ctrl y
    89: e => {
      if (!mind.allowUndo) return
      if (e.metaKey || e.ctrlKey) mind.redo()
    },
    // ctrl z
    90: e => {
      if (!mind.allowUndo) return
      if (e.metaKey || e.ctrlKey) mind.undo()
    },
    // ctrl +
    187: e => {
      if (e.metaKey || e.ctrlKey) {
        if (mind.scaleVal > 1.6) return
        mind.scale((mind.scaleVal += 0.2))
      }
    },
    // ctrl -
    189: e => {
      if (e.metaKey || e.ctrlKey) {
        if (mind.scaleVal < 0.6) return
        mind.scale((mind.scaleVal -= 0.2))
      }
    },
  }
  mind.map.onkeydown = e => {
    // console.log(e)
    e.preventDefault()
    if (!mind.editable) return
    // console.log(e, e.target)
    if (e.target !== e.currentTarget) {
      // input
      return
    }
    if (e.keyCode === 8 || e.keyCode === 46) {
      // del,backspace
      if (e.metaKey || e.ctrlKey) {
        if (mind.currentLink) mind.removeLink()
        else mind.removeNodeSelf()
      } else {
        if (mind.currentLink) mind.removeLink()
        else mind.removeNode()
      }
    } else {
      key2func[e.keyCode] && key2func[e.keyCode](e)
    }
  }
}
