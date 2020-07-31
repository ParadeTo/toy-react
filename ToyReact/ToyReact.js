const childrenSymbol = Symbol("children")
class ElementWrapper {
  constructor(type) {
    // this.root = document.createElement(type)
    this.type = type
    this.props = Object.create(null)
    this.children = []
    this[childrenSymbol] = []
  }
  setAttribute(name, value) {
    // if (name.match(/^on([\s\S]+)$/)) {
    //   this.root.addEventListener(
    //     RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase()),
    //     value
    //   )
    // }
    // if (name === "className") name = "class"
    // this.root.setAttribute(name, value)
    this.props[name] = value
  }
  appendChild(vchild) {
    // let range = document.createRange()
    // if (this.root.children.length) {
    //   range.setStartAfter(this.root.lastChild)
    //   range.setEndAfter(this.root.lastChild)
    // } else {
    //   range.setStart(this.root, 0)
    //   range.setEnd(this.root, 0)
    // }
    // vchild.mountTo(range)

    this.children.push(vchild.vdom)
    this[childrenSymbol].push(vchild)
  }
  get vdom() {
    return this
  }
  mountTo(range) {
    this.range = range

    let endRange = document.createRange()
    let placeholder = document.createComment("placeholder")
    endRange.setStart(range.endContainer, range.endOffset)
    endRange.setEnd(range.endContainer, range.endOffset)
    endRange.insertNode(placeholder)
    range.deleteContents()

    let element = document.createElement(this.type)
    for (let name in this.props) {
      let value = this.props[name]
      if (name.match(/^on([\s\S]+)$/)) {
        element.addEventListener(
          RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase()),
          value
        )
      }
      if (name === "className") name = "class"
      element.setAttribute(name, value)
    }

    for (let child of this.children) {
      const range = document.createRange()
      if (element.children.length) {
        range.setStartAfter(element.lastChild)
        range.setEndAfter(element.lastChild)
      } else {
        range.setStart(element, 0)
        range.setEnd(element, 0)
      }
      child.mountTo(range)
    }

    range.insertNode(element)
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
    this.type = "#text"
    this.children = []
    this.props = Object.create(null)
  }
  mountTo(range) {
    this.range = range
    range.deleteContents()
    range.insertNode(this.root)
  }
  get vdom() {
    return this
  }
}

export class Component {
  constructor() {
    this.children = []
    this.props = Object.create(null)
  }
  get type() {
    return this.constructor.name
  }
  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      console.log(RegExp.$1)
    }
    this.props[name] = value
    this[name] = value
  }
  mountTo(range) {
    this.range = range
    this.update()
    // let range = document.createRange()
    // range.setStartAfter(parent.lastChild)
    // range.setEndAfter(parent.lastChild)
  }
  update() {
    // let placeholder = document.createComment("placeholder")
    // let range = document.createRange()
    // range.setStart(this.range.endContainer, this.range.endOffset)
    // range.setEnd(this.range.endContainer, this.range.endOffset)
    // range.insertNode(placeholder)
    // this.range.deleteContents()
    let vdom = this.vdom
    if (this.oldVdom) {
      let isSameNode = (node1, node2) => {
        if (node1.type !== node2.type) return false
        for (let name in node1.props) {
          if (
            typeof node1.props[name] === "object" &&
            typeof node2.props[name] === "object" &&
            JSON.stringify(node1.props[name]) ===
              JSON.stringify(node2.props[name])
          )
            continue
          if (node1.props[name] !== node2.props[name]) return false
        }
        if (Object.keys(node1.props).length !== Object.keys(node2.props).length)
          return false
        return true
      }
      let isSameTree = (node1, node2) => {
        if (!isSameNode(node1, node2)) return false
        if (node1.children.length !== node2.children.length) return false

        for (let i = 0; i < node1.children.length; i++) {
          if (!isSameTree(node1.children[i], node2.children[i])) return false
        }

        return true
      }

      const replace = (newTree, oldTree) => {
        if (isSameTree(newTree, oldTree)) return
        if (!isSameNode(newTree, oldTree)) {
          newTree.mountTo(oldTree.range)
          // children
        } else {
          for (let i = 0; i < newTree.children.length; i++) {
            replace(newTree.children[i], oldTree.children[i])
          }
        }
      }

      replace(vdom, this.oldVdom)
    } else {
      vdom.mountTo(this.range)
    }
    this.oldVdom = vdom
    // placeholder.parentNode.removeChild(placeholder)
  }
  get vdom() {
    return this.render().vdom
  }
  appendChild(vchild) {
    this.children.push(vchild)
  }
  setState(state) {
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (typeof newState[p] === "object" && newState[p] !== null) {
          if (typeof oldState[p] !== "object") {
            if (newState[p] instanceof Array) oldState[p] = []
            else oldState[p] = {}
          }
          merge(oldState[p], newState[p])
        } else {
          oldState[p] = newState[p]
        }
      }
    }
    if (!this.state && state) {
      this.state = {}
    }
    merge(this.state, state)
    this.update()
  }
}

export let ToyReact = {
  createElement(type, attributes, ...children) {
    let element
    if (typeof type === "string") {
      element = new ElementWrapper(type)
    } else {
      element = new type()
    }
    console.log(attributes)
    for (let name in attributes) {
      element.setAttribute(name, attributes[name])
    }
    let insertChildren = (children) => {
      for (let child of children) {
        if (Array.isArray(child)) {
          insertChildren(child)
        } else {
          if (child === null || child === undefined) child = ""
          if (
            !(child instanceof Component) &&
            !(child instanceof ElementWrapper) &&
            !(child instanceof TextWrapper)
          ) {
            child = String(child)
          }
          if (typeof child === "string") {
            child = new TextWrapper(child)
          }
          element.appendChild(child)
        }
      }
    }
    insertChildren(children)

    return element
  },
  render(vdom, element) {
    let range = document.createRange()
    if (element.children.length) {
      range.setStartAfter(element.lastChild)
      range.setEndAfter(element.lastChild)
    } else {
      range.setStart(element, 0)
      range.setEnd(element, 0)
    }
    vdom.mountTo(range)
  },
}
