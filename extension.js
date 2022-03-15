/*
  eslint-disable
    @typescript-eslint/no-var-requires
 */

const vscode = require("vscode")

const cssToJs = require("./css-to-js.js")

/**
  Visual Studio Code extension that parses CSS rulesets and converts
  to an equivalent JavaScript object.

  @param {import ("vscode").ExtensionContext} context
  - Collection of utilities private to an extension.

  @returns {void}
 */

exports.activate = function activate (context) {
  const command = "ptb.cssToJs"

  /**
    Command handler function.

    @returns {void}
   */

  function handler () {
    const editor = vscode.window.activeTextEditor

    if (editor) {
      const text = editor.document.getText(editor.selection)

      editor.edit(
        function (e) {
          return e.replace(
            editor.selection,
            JSON.stringify(cssToJs(text), null, 2)
          )
        },
        {
          "undoStopAfter": true,
          "undoStopBefore": true
        }
      )

      if (editor.document.languageId === "css") {
        vscode.languages.setTextDocumentLanguage(editor.document, "json")
      }
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand(command, handler)
  )
}
