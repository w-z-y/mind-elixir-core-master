/* dropdown暂只支持纯文本输入框，需要扩展功能需要修改此处代码 */
import { selectText } from '../utils/dom'
const gap = 10
// 注册dropdown事件
function registDropdownEvent(dropdown) {
  const eventList = ['click', 'contextmenu']
  eventList.forEach(event => {
    document.body.addEventListener(event, (e: any) => {
      console.log('click-out-side')
      if (!dropdown.hidden && !dropdown.contains(e.target)) {
        dropdown.hidden = true
      }
    })
  })
}
// 监听dropdown显隐来触发回调
function observeDropdown(dropdown, fn) {
  const observer = new MutationObserver(() => {
    fn(dropdown.hidden)
  })
  observer.observe(dropdown, {
    attributes: true,
  })
}
function createInput(dropdown, mind) {
  // 文本域
  const textarea = document.createElement('textarea')
  textarea.id = 'input-tags'
  textarea.hidden = true
  textarea.addEventListener('keydown', e => {
    e.stopPropagation()
    const key = e.key
    if (key === 'Enter' || key === 'Tab') {
      textarea.blur()
      dropdown.hidden = true
      e.preventDefault()
    }
  })
  // 富文本
  const inputDiv = document.createElement('div')
  const input = document.createElement('div')
  inputDiv.id = 'input-notes'
  inputDiv.hidden = true

  input.className = 'input'
  input.contentEditable = 'true'
  input.textContent = ''
  input.spellcheck = false

  const tools = document.createElement('ul')
  tools.innerHTML = `<div></div>`
  input.addEventListener('keydown', e => {
    e.stopPropagation()
    if (e.code === 'Tab') {
      e.preventDefault()
    }
  })
  inputDiv.appendChild(tools)
  inputDiv.appendChild(input)
  dropdown.appendChild(textarea)
  dropdown.appendChild(inputDiv)
}
// 计算dropdown位置
function calcDropdownPosition(target, dropdown) {
  const { left, top, height } = target.getBoundingClientRect()
  const { width: dropdownWidth, height: dropdownHeight } = dropdown.getBoundingClientRect()
  if ((dropdownHeight + top + gap) > window.innerHeight) {
    dropdown.style.top = ''
    dropdown.style.bottom = `${window.innerHeight - top + gap}px`
  } else {
    dropdown.style.bottom = ''
    dropdown.style.top = top + height + gap + 'px'
  }
  if ((left + dropdownWidth + gap) > window.innerWidth) {
    dropdown.style.left = ''
    dropdown.style.right = `${gap}px`
  } else {
    dropdown.style.right = ''
    dropdown.style.left = Math.max(left, gap) + 'px'
  }
}
// 打开dropdown
export function onOpenDropdown(mind, flag) {
  const dropdown: HTMLElement = document.querySelector('dropdown')
  const textarea: any = document.querySelector('#input-tags')
  const inputDiv: any = document.querySelector('#input-notes')
  textarea.hidden = true
  inputDiv.hidden = true
  dropdown.hidden = !dropdown.hidden
  mind.currentNodeCache.flag = flag
  switch (flag) {
    case 'tags':
      textarea.hidden = false
      inputDiv.hidden = true
      textarea.value = ''
      // 设置光标位置
      setTimeout(() => {
        textarea.value = mind.currentNode.nodeObj[flag] || ''
        // 重置内容
        textarea.focus()
      }, 0)
      break
    case 'notes':
      inputDiv.hidden = false
      textarea.hidden = true
      inputDiv.querySelector('.input').innerHTML = ''
      // 设置光标位置
      setTimeout(() => {
        // 重置内容
        inputDiv.querySelector('.input').innerHTML = mind.currentNode.nodeObj[flag] || ''
        selectText(inputDiv.querySelector('.input'), true)
      }, 0)
      break
  }
  calcDropdownPosition(mind.currentNode, dropdown)
}
// 监听关闭dropdown
export function visibleChange(mind, dropdown) {
  observeDropdown(dropdown, visible => {
    let value = ''
    if (!mind.currentNodeCache) return
    if (visible) {
      switch (mind.currentNodeCache.flag) {
        case 'tags':
          const textarea: any = document.querySelector('#input-tags')
          value = textarea.value
          if (value) {
            const newTags = value.split(',')
            const tags = mind.currentNodeCache.nodeObj.tags || []
            if (tags.join(',') === value) return // 内容相同不做更新
            mind.updateNodeTags(mind.currentNodeCache.nodeObj, newTags)
          } else {
            // 修复添加标签无法清空的bug
            mind.updateNodeTags(mind.currentNodeCache.nodeObj, null)
          }
          mind.currentNodeCache = {}
          break
        case 'notes':
          const inputDiv: any = document.querySelector('#input-notes')
          value = inputDiv.querySelector('.input').innerHTML
          const notes = mind.currentNodeCache.nodeObj.notes
          if (notes === value) return // 内容相同不做更新
          mind.updateNodeNotes(mind.currentNodeCache.nodeObj, value)
          mind.currentNodeCache = {}
          break
      }
    }
  })
}
export default function(mind) {
  const dropdown = document.createElement('dropdown')
  // 创建输入框
  createInput(dropdown, mind)
  dropdown.hidden = true
  Object.assign(dropdown.style, {
    width: '280px',
    height: '140px',
  })
  registDropdownEvent(dropdown)
  visibleChange(mind, dropdown)
  mind.container.appendChild(dropdown)
  mind.container.onclick = function(e) {
    if (!dropdown.hidden) return
    if (!mind.editable) return
    let target = e.target
    const clickClassName = target.className || target.parentElement.className
    switch (clickClassName) {
      case 'tags':
        if (target.parentElement.className === 'tags') {
          target = target.parentElement
        }
        e.stopPropagation()
        mind.selectNode(target.parentElement)
        mind.currentNodeCache = target.parentElement
        onOpenDropdown(mind, 'tags')
        break
      case 'notes':
        e.stopPropagation()
        mind.selectNode(target.parentElement)
        mind.currentNodeCache = target.parentElement
        onOpenDropdown(mind, 'notes')
        break
    }
  }
}
