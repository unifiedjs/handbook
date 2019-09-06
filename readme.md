# unified handbook

**This is a work in progress**

This handbook describes the unified ecosystem. It goes in depth about the numerous syntaxes it supports, usage, and practical guides on writing plugins.

## Table of contents

-   [Introduction](#introduction)

-   [How does it work?](#how-does-it-work)

-   [Supported syntaxes](#supported-syntaxes)

-   [Abstract syntax trees](#abstract-syntax-trees)

    -   [Constructing an AST](#constructing-an-ast)

        -   [Parse example](#parse-example)

-   [unist](#unist)

    -   [Motivation](#motivation)
    -   [unist resources](#unist-resources)

-   [unified](#unified)

    -   [Parser](#parser)
    -   [Compiler](#compiler)
    -   [Transpiler](#transpiler)
    -   [Usage](#usage)

-   [remark](#remark)

    -   [remark CLI](#remark-cli)

    -   [remark guides](#remark-guides)

        -   [Writing a plugin to modify headings](#writing-a-plugin-to-modify-headings)

-   [rehype](#rehype)

-   [retext](#retext)

-   [MDX](#mdx)

-   [Collective](#collective)

-   [Authors](#authors)

-   [Acknowledgements](#acknowledgements)

## Introduction

**unified** enables new exciting projects like [Gatsby][] to pull in Markdown, [MDX][] to embed [JSX][], and [Prettier][] to format it. It’s used in about 300k projects on GitHub and has about 10m downloads each month on npm: you’re probably using it.

It powers [remarkjs][], [rehypejs][], [mdx-js][], [retextjs][], and [redotjs][]. It's used to build other projects like [prettier][], [gatsbyjs][], and more.

Some notable users are [Node.js][], [ZEIT][],  [Netlify][], [GitHub][], [Mozilla][], [WordPress][], [Adobe][], [Facebook][], [Google][].

## How does it work?

unified uses [abstract syntax trees][asts], or ASTs, that plugins can operate on. It can even process between different formats. This means you can parse a markdown document, transform it to HTML, and then transpile back to markdown.

unified leverages a syntax tree specification (called [unist][] or UST) so that utilities can be shared amongst different formats. In practice, you can use `unist-util-visit` to visit nodes **using the same library with the same API** on any supported AST.

```js
visit(markdownAST, 'images', transformImages)
visit(htmlAST, 'img', transformImgs)
```

## Supported syntaxes

unified supports a few different syntaxes. Each have their own formal specification and are compatible with all `unist` utility libraries.

-   **[mdast][]**/**[remarkjs][]**: Markdown
-   **[hast][]**/**[rehypejs][]**: HTML
-   **[nlcst][]**/**[retextjs][]**: Natural language
-   **[mdxast][]**/**[mdx-js][]**: MDX

Each syntax has its own GitHub organization and subset of plugins and libraries.

## Abstract syntax trees

An abstract syntax tree, or AST, is a representation of input. It's an abstraction that enables developers to analyze, transform and generate code.

They're the integral data structure in the unified ecosystem. Most plugins operate solely on the AST, receiving it as an argument and then returning a new AST afterwards.

Your most basic plugin looks like the following (where the tree is an AST):

```js
module.exports = options => tree => {
  return tree
}
```

### Constructing an AST

In order to form an AST, unified takes an input string and passes that
to a tokenizer. A tokenizer breaks up the input into tokens based on the
syntax. In unified the tokenizer and lexer are coupled. When syntax is
found the string is "eaten" and it's given metadata like node type (this
is the "lexer").

Then, the parser turns this information into an AST. All together the
pipeline looks like:

    [INPUT] => [TOKENIZER/LEXER] => [PARSER] => [AST]

#### Parse example

Consider this markdown input:

```md
# Hello, **world**!
```

The tokenizer will match the "#" and create a heading node. Then
it will begin searching for inline syntax where it will encounter
"\*\*" and create a strong node.

It's important to note that the parser first looks for block-level
syntax which includes headings, code blocks, lists, paragraphs,
and block quotes.

Once a block has been opened, inline tokenization begins which searches
for syntax including bold, code, emphasis, and links.

The markdown will result in the following AST:

```json
{
  "type": "heading",
  "depth": 1,
  "children": [
    {
      "type": "text",
      "value": "Hello, ",
      "position": {
        "start": {
          "line": 1,
          "column": 3,
          "offset": 2
        },
        "end": {
          "line": 1,
          "column": 10,
          "offset": 9
        },
        "indent": []
      }
    },
    {
      "type": "strong",
      "children": [
        {
          "type": "text",
          "value": "world",
          "position": {
            "start": {
              "line": 1,
              "column": 12,
              "offset": 11
            },
            "end": {
              "line": 1,
              "column": 17,
              "offset": 16
            },
            "indent": []
          }
        }
      ],
      "position": {
        "start": {
          "line": 1,
          "column": 10,
          "offset": 9
        },
        "end": {
          "line": 1,
          "column": 19,
          "offset": 18
        },
        "indent": []
      }
    },
    {
      "type": "text",
      "value": "!",
      "position": {
        "start": {
          "line": 1,
          "column": 19,
          "offset": 18
        },
        "end": {
          "line": 1,
          "column": 20,
          "offset": 19
        },
        "indent": []
      }
    }
  ],
  "position": {
    "start": {
      "line": 1,
      "column": 1,
      "offset": 0
    },
    "end": {
      "line": 1,
      "column": 20,
      "offset": 19
    },
    "indent": []
  }
}
```

A compiler turns an AST into output (typically a string). It provides
functions that handle each node type and compiles them to the desired
end result.

For example, a compiler for markdown would encounter a `link` node and
transform it into `[]()` markdown syntax.

    [AST] => [COMPILER] => [OUTPUT]

It would turn the AST example above _back_ into the source markdown when
compiling to markdown. It could also be compiled to HTML and would result
in:

```html
<h1>
  Hello, <strong>world</strong>!
</h1>
```

## unist

unist is a specification for syntax trees which ensures that libraries that work with unified are as interoperable as possible. **All ASTs in unified conform to this spec**. It's the bread and butter of the ecosystem.

### Motivation

A standard AST allows developers to use the same visitor function on all formats, whether it's markdown, HTML, natural language, or MDX. Using the same library ensures that the core functionality is as solid as possible while cutting down on cognitive overhead when trying to perform common tasks.

### unist resources

-   [Read more about unist →](https://github.com/syntax-tree/unist)
-   [See the list of unist utilities →](https://github.com/syntax-tree/unist/blob/master/readme.md#utilities)

## unified

unified is the interface for working with syntax trees and can be used in the same way for any of the supported syntaxes.

For unified to work it requires two key pieces: a parser and a compiler.

### Parser

A parser takes a string and tokenizes it based on syntax. A markdown parser would turn `# Hello, world!` into a `heading` node.

unified has a parser for each of its supported syntax trees.

### Compiler

A compiler turns an AST into its "output". This is typically a string. In some cases folks want to parse a markdown document, transform it, and then write back out markdown (like Prettier). In other cases folks might want to turn markdown into HTML.

unified already supports compilers for most common outputs including markdown, HTML, text, and MDX. It even offers compilers for less common use cases including compiling markdown to CLI manual pages.

### Transpiler

unified also offers transpilers. This is how one syntax tree is converted to another format. The most common transpiler is `mdast-util-to-hast` which converts the markdown AST (mdast) to the HTML AST (hast).

### Usage

unified should be invoked:

```js
unified()
```

Passed plugins:

```js
.use(remarkParse)
```

And then given a string to operate on:

```js
.process('# Hello, world!', (err, file) => {
  console.log(String(file))
})
```

A more real-world example might want to turn a markdown document into an HTML string which would look something like:

```js
var unified = require('unified')
var markdown = require('remark-parse')
var remark2rehype = require('remark-rehype')
var doc = require('rehype-document')
var format = require('rehype-format')
var html = require('rehype-stringify')
var report = require('vfile-reporter')

unified()
  .use(markdown)
  .use(remark2rehype)
  .use(doc, {title: '👋🌍'})
  .use(format)
  .use(html)
  .process('# Hello world!', function(err, file) {
    console.error(report(err || file))
    console.log(String(file))
  })
```

**The code is doing the following**

-   Receives a markdown string (`process()`)
-   Parses the markdown (`.use(markdown)`)
-   Converts the mdast to hast (`.use(remark2rehype)`)
-   Wraps the hast in a document (`.use(doc)`)
-   Formats the hast (`.use(format)`)
-   Converts the hast to HTML (`.use(html)`)

It'll result in an HTML string:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>👋🌍</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <h1>Hello world!</h1>
  </body>
</html>
```

## remark

remark is a plugin-based markdown processor. It has the ability to parse
markdown, transform it with plugins, and then write back to markdown or
transpile it to another format like HTML.

It's highly configurable. Even plugins can customize the parser and compiler
if needed.

You can use the remark library directly in your scripts:

```js
remark()
  .processSync('# Hello, world!')
```

Though, it's really a shortcut for:

```js
unified()
  .use(remarkParse)
  .use(remarkStringify)
  .processSync('# Hello, world!')
```

### remark CLI

remark offers a CLI that can be used as well.

### remark guides

#### Writing a plugin to modify headings

`unist-util-visit` is useful for visiting nodes in an AST based on a particular
type. To visit all headings you can use it like so:

```js
module.exports = () => tree => {
  visit(tree, 'heading', node => {
    console.log(node)
  })
}
```

The above will log all heading nodes. Heading nodes also have a `depth` field which
indicates whether it's `h1`-`h6`. You can use that to narrow down what heading
nodes you want to operate on.

Below is a plugin that prefixes "BREAKING" to all `h1`s in a markdown document.

```js
const visit = require('unist-util-visit')

module.exports = () => tree => {
  visit(tree, 'heading', node => {
    if (node.depth !== 1) {
      return
    }

    visit(node, 'text', textNode => {
      textNode.value = 'BREAKING ' + textNode.value
    })
  })
}
```

[Watch the lesson on egghead →](https://egghead.io/lessons/javascript-create-a-remark-plugin-to-modify-markdown-headings)

## rehype

## retext

## MDX

## Collective

unified was originally created by [Titus Wormer][wooorm]. It's now governed by a collective which handles the many GitHub organizations, repositories, and packages that are part of the greater unified ecosystem.

The collective and its governance won't be addressed in this handbook. If you're interested, you can [read more about the collective](https://github.com/unifiedjs/collective)
on GitHub.

## Authors

-   [John Otander][johno]
-   [Titus Wormer][wooorm]

## Acknowledgements

This handbook is inspired by the [babel-handbook][] written by
[James Kyle][jamiebuilds].

[Adobe]: https://www.adobe.com

[Facebook]: https://www.facebook.com

[GitHub]: https://github.com

[Google]: https://www.google.com

[Mozilla]: https://www.mozilla.org

[Netlify]: https://www.netlify.com

[Node.js]: https://nodejs.org

[WordPress]: https://wordpress.com

[ZEIT]: https://zeit.co

[asts]: https://github.com/syntax-tree

[babel-handbook]: https://github.com/jamiebuilds/babel-handbook

[gatsby]: https://gatsbyjs.org

[gatsbyjs]: https://gatsbyjs.org

[hast]: https://github.com/syntax-tree/hast

[jamiebuilds]: https://github.com/jamiebuilds

[johno]: https://johno.com

[jsx]: https://reactjs.org/docs/jsx-in-depth.html

[mdast]: https://github.com/syntax-tree/mdast

[mdx-js]: https://github.com/mdx-js

[mdx]: https://mdxjs.com

[mdxast]: https://github.com/syntax-tree/mdxast

[nlcst]: https://github.com/syntax-tree/nlcst

[prettier]: https://prettier.io

[redotjs]: https://github.com/redotjs

[rehypejs]: https://github.com/rehypejs

[remarkjs]: https://github.com/remarkjs

[retextjs]: https://github.com/retextjs

[unist]: https://github.com/syntax-tree/unist

[wooorm]: https://github.com/wooorm
