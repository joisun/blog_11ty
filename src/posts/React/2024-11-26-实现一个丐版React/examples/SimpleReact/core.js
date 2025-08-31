const SimpleReact = {
  createElement(type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.map(child =>
          typeof child === 'object' ? child : SimpleReact.createTextNode(child),
        ),
      },
    }
  },
  createTextNode(text) {
    return {
      type: 'TEXT_ELEMENT',
      props: {
        nodeValue: text,
        children: [],
      },
    }
  },
  render(element, container) {
    const dom
      = element.type === 'TEXT_ELEMENT'
        ? document.createTextNode('')
        : document.createElement(element.type)

    Object.keys(element.props)
      .filter(prop => prop !== 'children') // children 不是dom 属性，而是子元素
      .forEach((prop) => {
        dom[prop] = element.props[prop]
      })

    element.props.children.forEach((child) => {
      SimpleReact.render(child, dom)
    })

    container.appendChild(dom)
  },
}

export default SimpleReact

function createDom(fiber) {
  const dom
    = fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type)

  Object.keys(fiber.props)
    .filter(prop => prop !== 'children') // children 不是dom 属性，而是子元素
    .forEach((prop) => {
      dom[prop] = fiber.props[prop]
    })

  return dom
}

function render(fiber, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  }
}

let nextUnitOfWork = null
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
  // add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  if (fiber.parent) {
    fiber.parant.dom.appendChild(fiber.dom)
  }

  // create new fibers
  const elements = fiber.props.children
  let index = 0
  let prevSibling = null
  while (index < elements.length) {
    const element = elements[index]
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }
    if (index === 0) {
      fiber.child = newFiber
    }
    else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }

  // return next unit of work
  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}
