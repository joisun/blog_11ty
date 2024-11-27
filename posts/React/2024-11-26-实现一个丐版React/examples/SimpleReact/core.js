const SimpleReact = {
  createElement(type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.map((child) =>
          typeof child === "object" ? child : SimpleReact.createTextNode(child)
        ),
      },
    };
  },
  createTextNode(text) {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text,
        children: [],
      },
    };
  },
  render(element, container) {
    const dom =
      element.type === "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(element.type);

    Object.keys(element.props)
      .filter((prop) => prop !== "children") // children 不是dom 属性，而是子元素
      .forEach((prop) => {
        dom[prop] = element.props[prop];
      });

    element.props.children.forEach((child) => {
      SimpleReact.render(child, dom);
    });

    container.appendChild(dom);
  },
};

export default SimpleReact;
