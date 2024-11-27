import SimpleReact from "../core.js";

/** @jsx SimpleReact.createElement */
const User = () => {
  return SimpleReact.createElement("div", null, SimpleReact.createElement("h1", null, "User"), SimpleReact.createElement("p", null, "user info"));
};