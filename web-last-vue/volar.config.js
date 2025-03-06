module.exports = {
  plugins: [
    {
      name: 'vue-language-features',
      // 启用Vue语言功能
      enabledLanguageFeatures: {
        semanticTokens: true,
        references: true,
        definitions: true,
        diagnostics: true,
        documentSymbol: true,
        documentHighlight: true,
        documentFormatting: {
          defaultPrintWidth: 100
        }
      },
      // 启用Vue文档功能
      enabledDocumentFeatures: {
        documentColor: true,
        documentFormatting: true,
        documentSymbol: true,
        documentLink: true,
        hover: true,
        completion: {
          defaultTagNameCase: 'kebab',
          defaultAttrNameCase: 'kebab',
          getDocumentSelectionCompletionItems: true
        }
      }
    }
  ]
}
