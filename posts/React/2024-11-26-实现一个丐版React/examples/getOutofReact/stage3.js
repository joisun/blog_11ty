// const element = <h1 title="foo">Hello</h1>
const element = {
    type: "h1",
    props: {
      title: "foo",
      children: "Hello",
    },
  };
  const container = document.getElementById("root");
  ReactDOM.render(element, container);