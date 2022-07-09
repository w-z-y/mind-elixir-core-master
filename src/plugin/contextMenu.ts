import i18n from '../i18n'
import { encodeHTML } from '../utils/index'
import { cloneDeep } from 'lodash'
import { onOpenDropdown } from '../plugin/dropdown'
export default function(mind, option) {
  const createTips = words => {
    const div = document.createElement('div')
    div.innerText = words
    div.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);'
    return div
  }
  const createLi = (id, name, keyname) => {
    const li = document.createElement('li')
    li.id = id
    li.innerHTML = `<span>${encodeHTML(name)}</span><span>${encodeHTML(keyname)}</span>`
    return li
  }
  const locale = i18n[mind.locale] ? mind.locale : 'en'

  /* 调整菜单顺序 */
  const add_child = createLi('cm-add_child', i18n[locale].addChild, 'Tab')
  const add_sibling = createLi('cm-add_sibling', i18n[locale].addSibling, 'Enter')
  const add_parent = createLi('cm-add_parent', i18n[locale].addParent, 'Shift+Tab')

  const add_notes_btn = createLi('cm-notes', '备注', '')
  const add_tags_btn = createLi('cm-notes', '标签', '')

  const remove_child = createLi(
    'cm-remove_child',
    i18n[locale].removeNode,
    'Del'
  )
  const remove_self = createLi('cm-remove_self', i18n[locale].removeSelfNode, 'Ctrl+Del')
  const focus = createLi('cm-fucus', i18n[locale].focus, '')
  const unfocus = createLi('cm-unfucus', i18n[locale].cancelFocus, '')
  const up = createLi('cm-up', i18n[locale].moveUp, 'PgUp')
  const down = createLi('cm-down', i18n[locale].moveDown, 'Pgdn')
  const link = createLi('cm-down', i18n[locale].link, '')
  const expand_btn = createLi('cm-expand', i18n[locale].foldChild, '')
  const expand_all_btn = createLi('cm-expand-all', i18n[locale].foldAllChild, '')
  const copy_btn = createLi('cm-copy', i18n[locale].copy, 'Ctrl+C')
  const cut_btn = createLi('cm-cut', i18n[locale].cut, 'Ctrl+X')
  const paste_btn = createLi('cm-paste', i18n[locale].paste, 'Ctrl+V')

  const menuUl = document.createElement('ul')
  menuUl.className = 'menu-list'
  menuUl.style['pointer-events'] = 'auto'
  menuUl.appendChild(add_child)
  menuUl.appendChild(add_sibling)
  menuUl.appendChild(add_parent)
  menuUl.appendChild(add_notes_btn)
  menuUl.appendChild(add_tags_btn)
  menuUl.appendChild(expand_btn)
  menuUl.appendChild(expand_all_btn)
  menuUl.appendChild(copy_btn)
  menuUl.appendChild(cut_btn)
  menuUl.appendChild(paste_btn)
  menuUl.appendChild(remove_child)
  menuUl.appendChild(remove_self)
  if (!option || option.focus) {
    menuUl.appendChild(focus)
    menuUl.appendChild(unfocus)
  }
  // menuUl.appendChild(up)
  // menuUl.appendChild(down)
  if (!option || option.link) {
    menuUl.appendChild(link)
  }
  if (option && option.extend) {
    for (let i = 0; i < option.extend.length; i++) {
      const item = option.extend[i]
      const dom = createLi(item.name, item.name, item.key || '')
      menuUl.appendChild(dom)
      dom.onclick = e => {
        item.onclick(e)
      }
    }
  }
  const menuContainer = document.createElement('cmenu')
  menuContainer.style['pointer-events'] = 'none'
  menuContainer.appendChild(menuUl)
  menuContainer.hidden = true
  mind.container.append(menuContainer)
  let isRoot = true
  mind.container.oncontextmenu = function(e) {
    const dropdown:HTMLElement = document.querySelector('dropdown')
    menuContainer.hidden = true
    dropdown.hidden = true
    e.preventDefault()
    if (!mind.editable) return
    // console.log(e.pageY, e.screenY, e.clientY)
    const target = e.target
    if (target.tagName === 'TPC') {
      if (target.parentElement.tagName === 'ROOT') {
        isRoot = true
      } else {
        isRoot = false
      }
      if (isRoot) {
        focus.className = 'disabled'
        up.className = 'disabled'
        down.className = 'disabled'
        add_sibling.className = 'disabled'
        add_parent.className = 'disabled'
        remove_child.className = 'disabled'
        remove_self.className = 'disabled'
        expand_btn.className = 'disabled'
      } else {
        focus.className = ''
        up.className = ''
        down.className = ''
        add_sibling.className = ''
        add_parent.className = ''
        remove_child.className = ''
        remove_self.className = ''
        expand_btn.className = ''
      }
      mind.selectNode(target)
      menuContainer.hidden = false
      const height = menuUl.offsetHeight
      const width = menuUl.offsetWidth
      if (height + e.clientY > window.innerHeight) {
        menuUl.style.top = ''
        menuUl.style.bottom = '0px'
      } else {
        menuUl.style.bottom = ''
        menuUl.style.top = e.clientY + 15 + 'px'
      }
      if (width + e.clientX > window.innerWidth) {
        menuUl.style.left = ''
        menuUl.style.right = '0px'
      } else {
        menuUl.style.right = ''
        menuUl.style.left = e.clientX + 10 + 'px'
      }
      const expand_btn_text = target.nodeObj.expanded === false ? i18n[locale].unfoldChild : i18n[locale].foldChild
      expand_btn.firstElementChild.innerHTML = expand_btn_text
    }
  }

  menuContainer.onclick = e => {
    if (e.target === menuContainer) menuContainer.hidden = true
  }

  add_child.onclick = e => {
    mind.addChild()
    menuContainer.hidden = true
  }
  add_parent.onclick = e => {
    if (isRoot) return
    mind.insertParent()
    menuContainer.hidden = true
  }
  add_sibling.onclick = e => {
    if (isRoot) return
    mind.insertSibling()
    menuContainer.hidden = true
  }
  add_notes_btn.onclick = e => {
    e.stopPropagation()
    mind.currentNodeCache = mind.currentNode
    onOpenDropdown(mind, 'notes')
    menuContainer.hidden = true
  }
  add_tags_btn.onclick = e => {
    e.stopPropagation()
    mind.currentNodeCache = mind.currentNode
    onOpenDropdown(mind, 'tags')
    menuContainer.hidden = true
  }
  remove_child.onclick = e => {
    if (isRoot) return
    mind.removeNode()
    menuContainer.hidden = true
  }
  remove_self.onclick = e => {
    if (isRoot) return
    mind.removeNodeSelf()
    menuContainer.hidden = true
  }
  focus.onclick = e => {
    if (isRoot) return
    mind.focusNode(mind.currentNode)
    menuContainer.hidden = true
  }
  unfocus.onclick = e => {
    mind.cancelFocus()
    menuContainer.hidden = true
  }
  up.onclick = e => {
    if (isRoot) return
    mind.moveUpNode()
    menuContainer.hidden = true
  }
  down.onclick = e => {
    if (isRoot) return
    mind.moveDownNode()
    menuContainer.hidden = true
  }
  link.onclick = e => {
    menuContainer.hidden = true
    const from = mind.currentNode
    const tips = createTips(i18n[locale].clickTips)
    mind.container.appendChild(tips)
    mind.map.addEventListener(
      'click',
      e => {
        e.preventDefault()
        tips.remove()
        if (
          e.target.parentElement.nodeName === 'T' ||
          e.target.parentElement.nodeName === 'ROOT'
        ) {
          mind.createLink(from, mind.currentNode)
        } else {
          console.log('取消连接')
        }
      },
      {
        once: true,
      }
    )
  }
  /* 添加展开、收起点击事件 */
  expand_btn.onclick = e => {
    if (isRoot) return
    mind.expandNode(mind.currentNode)
    menuContainer.hidden = true
  }
  expand_all_btn.onclick = e => {
    const nodeData = mind.nodeData
    console.log(mind.currentNode, mind.root)
    const toExpand = nodeObj => {
      if (nodeObj.root) {
        nodeObj.children.forEach(item => toExpand(item))
        return
      }
      if (nodeObj.children && nodeObj.children.length) {
        nodeObj.expanded = false
        nodeObj.children.forEach(item => toExpand(item))
      }
    }
    toExpand(nodeData)
    mind.refresh()
    menuContainer.hidden = true
  }
  copy_btn.onclick = e => {
    // ctrl c
    mind.waitCopy = mind.currentNode.cloneNode()
    mind.currentNode.nodeObj.root = false
    mind.waitCopy.nodeObj = cloneDeep(mind.currentNode.nodeObj)
    menuContainer.hidden = true
  }
  cut_btn.onclick = e => {
    // copy + remove
    if (isRoot) return
    mind.waitCopy = mind.currentNode.cloneNode()
    mind.currentNode.nodeObj.root = false
    mind.waitCopy.nodeObj = cloneDeep(mind.currentNode.nodeObj)
    mind.removeNode()
    menuContainer.hidden = true
  }
  paste_btn.onclick = e => {
    if (!mind.waitCopy) return
    // ctrl v
    mind.copyNode(mind.waitCopy, mind.currentNode)
    menuContainer.hidden = true
    // mind.waitCopy = null
  }
}
