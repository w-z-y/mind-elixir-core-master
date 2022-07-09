import { findEle } from './utils/dom'
import Bus from './utils/pubsub'
import { getSiblingId } from './utils/index'
export const E = findEle
type operation = {
  name: string,
  redo: boolean
}
export const operationList = [
  // drag
  'moveNode', // dragEnter
  'moveNodeBefore', // dragBefore
  'moveNodeAfter', // dragAfter
  'insertParent', // 插入父级
  'removeNode', // 删除节点
  'addChild', // 添加节点
  'copyNode', // 复制节点
  'removeNodeSelf', // 删除当前节点
  'insertSibling',
  // style
  'editStyle',
  'editTags',
  'editNotes',
  // text
  'finishEdit', // 编辑节点文本
]

// 添加撤回历史
export const logHistory = function() {
  this.bus = new Bus()
  ;(this.bus as any).addListener('operation', (operation: operation) => {
    // isUndo为true，则不添加到 history
    if (this.isUndo) {
      this.isUndo = false
      return
    }
    if (operationList.includes(operation.name)) {
      console.log('------------add history-----------')
      this.unhistory = []
      this.history.push(operation)
    }
  })
  this.history = [] // TODO
  this.unhistory = []
  this.isUndo = false
}

// ctrl + z
export const undo = function() {
  const operation = this.history.pop()
  if (!operation) return
  this.unhistory.push(operation)
  this.isUndo = true
  switch (operation.name) {
    case 'removeNodeSelf':
      // 遍历删除子节点
      operation.obj.children.forEach(child => {
        this.removeNode(findEle(child.id)) // 走完一次会将 isUndo 变为 false
        this.isUndo = true // 必须设置为true,不然除第一个，后面的会添加进 history
      })
      if (operation.originSiblingId) {
        this.insertBefore(E(operation.originSiblingId), operation.obj)
      } else {
        this.addChild(E(operation.originParentId), operation.obj)
      }
      break
    case 'moveNode':
    case 'moveNodeAfter':
    case 'moveNodeBefore':
      // 记录当前位置
      operation.tempOriginSiblingId = getSiblingId(operation.obj.fromObj)
      this.removeNode(findEle(operation.obj.fromObj.id))
      this.isUndo = true
      if (operation.originSiblingId) {
        this.insertBefore(E(operation.originSiblingId), operation.obj.fromObj)
      } else {
        this.addChild(E(operation.obj.originParentId), operation.obj.fromObj)
      }
      break
    // {
    //   const { fromObj, toObj } = operation.obj
    //   this[operation.name](E(toObj.id), E(fromObj.id))
    //   break
    // }
    case 'editStyle':
    {
      const { origin } = operation
      operation.origin = operation.obj.style
      operation.obj.style = origin
      this.updateNodeStyle(operation.obj)
      break
    }
    case 'editTags':
    {
      const { origin } = operation
      operation.origin = operation.obj.tags
      operation.obj.tags = origin
      this.updateNodeTags(operation.obj, origin)
      break
    }
    case 'editNotes':
    {
      const { origin } = operation
      operation.origin = operation.obj.notes
      operation.obj.notes = origin
      this.updateNodeNotes(operation.obj, origin)
      break
    }
    case 'insertParent':
      // 撤回插入父主题
      this.removeNodeSelf(E(operation.obj.id))
      break
    case 'removeNode':
      if (operation.originSiblingId) {
        this.insertBefore(E(operation.originSiblingId), operation.obj)
      } else {
        // 撤销删除最下面的一个节点
        this.addChild(E(operation.originParentId), operation.obj)
      }
      break
    case 'addChild':
    case 'copyNode':
    case 'insertSibling': // 撤销Enter
      this.removeNode(E(operation.obj.id))
      break
    case 'finishEdit':
      this.setNodeTopic(E(operation.obj.id), operation.origin)
      break
    default:
      this.isUndo = false
      break
  }
}

// ctrl + y
export const redo = function() {
  const operation = this.unhistory.pop()
  if (!operation) return
  this.history.push(operation)
  this.isUndo = true
  switch (operation.name) {
    case 'removeNodeSelf':
      this.removeNodeSelf(E(operation.obj.id))
      break
    case 'moveNode':
    case 'moveNodeAfter':
    case 'moveNodeBefore':
      this.removeNode(findEle(operation.obj.fromObj.id))
      this.isUndo = true
      if (operation.tempOriginSiblingId) {
        this.insertBefore(E(operation.tempOriginSiblingId), operation.obj.fromObj)
      } else {
        this.addChild(E(operation.obj.toObj.id), operation.obj.fromObj)
      }
      break
    // {
    //   const { fromObj, toObj } = operation.obj
    //   this[operation.name](E(fromObj.id), E(toObj.id))
    //   break
    // }
    case 'editStyle':
    {
      const { origin } = operation
      operation.origin = operation.obj.style
      operation.obj.style = origin
      this.updateNodeStyle(operation.obj)
      break
    }
    case 'editTags':
    {
      const { origin } = operation
      operation.origin = operation.obj.tags
      operation.obj.tags = origin
      this.updateNodeTags(operation.obj, origin)
      break
    }
    case 'editNotes':
    {
      const { origin } = operation
      operation.origin = operation.obj.notes
      operation.obj.notes = origin
      this.updateNodeNotes(operation.obj, origin)
      break
    }
    case 'insertParent':
      // 插入父主题
      this.insertParent(E(operation.obj.children[0].id), operation.obj)
      break
    case 'removeNode':
      this.removeNode(E(operation.obj.id))
      break
    case 'addChild':
    case 'copyNode':
      this.addChild(E(operation.obj.parent.id), operation.obj)
      break
    case 'insertSibling': // Enter
      this.insertSibling(E(operation.insertSiblingId), operation.obj)
      break
    case 'finishEdit':
      this.setNodeTopic(E(operation.obj.id), operation.obj.topic)
      break
    default:
      this.isUndo = false
      break
  }
}
