import React from "react";
import fs from 'node:fs'
var Card = function () {
  return /*#__PURE__*/ React.createElement(
    React.Fragment,
    null,
    /*#__PURE__*/ React.createElement(
      "div",
      null,
      /*#__PURE__*/ React.createElement(
        "div",
        null,
        /*#__PURE__*/ React.createElement("div", null, "The Coldest Sunset"),
        /*#__PURE__*/ React.createElement(
          "p",
          null,
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil."
        )
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        null,
        /*#__PURE__*/ React.createElement("span", null, "#photography"),
        /*#__PURE__*/ React.createElement("span", null, "#travel"),
        /*#__PURE__*/ React.createElement("span", null, "#winter")
      )
    )
  );
};
export default Card;
fs.writeFileSync('./app.output.json', JSON.stringify(Card()));