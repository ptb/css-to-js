/*
  eslint-disable
    @typescript-eslint/no-var-requires
 */

const { camelCase, isArr, isObj, isStr, merge } = require("@ptb/style")

const postcss = require("./postcss.js")

/**
  @typedef {import ("@ptb/style").PlainObject} PlainObject

  @typedef {import ("@ptb/style").StylesObject} StylesObject

  @typedef {import ("postcss").ChildNode} ChildNode
 */

/**
  Parses CSS rulesets and converts to an equivalent JavaScript object.

  @param {string | ChildNode[] | PlainObject} input
  - String containing a CSS stylesheet or rulesets.
  - Array containing PostCSS `ChildNodes`.
  - Object containing PostCSS abstract syntax tree.

  @returns {StylesObject}
    Plain JavaScript object containing CSS styles.
 */

module.exports = function cssToJs (input) {
  if (isArr(input)) {
    return input.reduce(
      /**
        Process PostCSS AST nodes and convert to JavaScript object.

        @param {StylesObject} output
        - Plain JavaScript object containing CSS styles.

        @param {ChildNode} node
        - Object containing PostCSS abstract syntax tree.

        @returns {StylesObject}
          Plain JavaScript object containing CSS styles.
       */

      function (output, node) {
        switch (node.type) {
          case "decl": {
            const prop = camelCase(node.prop)

            return /** @type {StylesObject} */ (merge(output, {
              [prop]: node.value
            }))
          }
          case "rule": {
            const selector = node.selector.replace(/[\n\r\s]+/gu, " ")

            return /** @type {StylesObject} */ (merge(output, {
              [selector]: cssToJs(node.nodes)
            }))
          }
          case "atrule": {
            if (["media", "supports"].includes(node.name)) {
              const atrule = ["@", node.name, " ", node.params].join("")

              return /** @type {StylesObject} */ (merge(output, {
                [atrule]: cssToJs(node.nodes)
              }))
            }

            return output
          }
          default:
            return output
        }
      }, {}
    )
  }

  if (isObj(input) && input.type === "root") {
    return cssToJs(input.nodes)
  }

  if (isStr(input)) {
    return cssToJs(
      postcss()
        .process(input, { "from": undefined })
        .sync()
        .root.toJSON()
    )
  }
  return {}
}
