const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
};
const container = document.getElementById("root");
// ReactDOM.render(element, container);

render(element, container);
function render(element, container) {
  const node = document.createElement(element.type);
  node["title"] = element.props.title;

  const text = document.createTextNode("");
  text["nodeValue"] = element.props.children;

  node.appendChild(text);
  container.appendChild(node);
}
