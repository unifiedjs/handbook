# unified Handbook

**This is a work in progress**

This handbook describes the unified ecosystem. It goes in depth about the numerous syntaxes it supports, how to use it, and practical guides on writing plugins.

## Table of Contents

-   [Introduction](#introduction)

-   [How Does it Work?](#how-does-it-work)

-   [Supported Syntaxes](#supported-syntaxes)

-   [Abstract Syntax Tree](#abstract-syntax-tree)

-   [unist](#unist)

    -   [Motivation](#motivation)
    -   [Related](#related)

-   [unified](#unified)

    -   [Parser](#parser)
    -   [Compiler](#compiler)
    -   [Transpiler](#transpiler)
    -   [Usage](#usage)

-   [remark](#remark)

-   [rehype](#rehype)

-   [retext](#retext)

-   [MDX](#mdx)

-   [Collective](#collective)

-   [Authors](#authors)

-   [Related](#related-1)

## Introduction

**unified** enables new exciting projects like [Gatsby][] to pull in Markdown, [MDX][] to embed [JSX][], and [Prettier][] to format it. It’s used in about 300k projects on GitHub and has about 10m downloads each month on npm: you’re probably using it.

It powers [remarkjs][], [rehypejs][], [mdx-js][], [retextjs][], and [redotjs][]. It's used to build other projects like [prettier][], [gatsbyjs][], and more.

Some notable users are [Node.js][], [ZEIT][],  [Netlify][], [GitHub][], [Mozilla][], [WordPress][], [Adobe][], [Facebook][], [Google][], and many more.

## How Does it Work?

unified uses [abstract syntax trees][asts], or ASTs, that plugins can operate on and even process between different formats. This means you can parse a Markdown document, transform it to HTML, and then even transpile back to Markdown!

unified leverages a syntax tree specification (called [unist][] or UST) so that utilities can be shared amongst different formats. In practice, you can use `unist-util-visit` to visit nodes **using the same library with the same API** on any supported AST.

```js
visit(markdownAST, 'images', transformImages)
visit(htmlAST, 'img', transformImgs)
```

## Supported Syntaxes

unified supports a few different syntaxes. Each have their own formal specification and are compatible with all `unist` utility libraries.

-   [mdast][]/[remarkjs][]: Markdown
-   [hast][]/[rehypejs][]: HTML
-   [nlcst][]/[retextjs][]: Natural language
-   [mdxast][]/[mdx-js][]: MDX

Each syntax has its own GitHub organization and subset of plugins and libraries.

## Abstract Syntax Tree

An Abstract Syntax Tree, or AST, is a representation of input. It's an abstraction that enables developers to analyze, transform and generate code.

They're the integral data structure in the unified ecosystem. Most plugins operate solely on the AST, receiving it as an argument and then returning a new AST afterwards.

Your most basic plugin looks like the following (where tree is an AST):

```js
module.exports = options => tree => {
  return tree
}
```

## unist

unist is a specification for syntax trees which ensures that libraries that work with unified are as interoperable as possible. **All ASTs in unified conform to this spec**. It's the bread and butter of the ecosystem.

### Motivation

A standard AST allows developers to use the same visitor function on all formats, whether it's markdown, HTML, natural language, or MDX. Using the same library ensures that the core functionality is as solid as possible while cutting down on cognitive overhead when trying to perform common tasks.

### Related

-   [Read more about units →](https://github.com/syntax-tree/unist)
-   [See the list of units utilities →](https://github.com/syntax-tree/unist/blob/master/readme.md#utilities)

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

The code is doing the following:

-   Receives a markdown string (`process()`)
-   Parses the markdown (`.use(markdown)`)
-   Converts the mdast to hast (`.use(remark2rehype)`)
-   Wraps the hast in a document (`.use(doc)`)
-   Formats the hast (`.use(format)`)
-   Converts the hast to HTML (`.use(html)`)

It'll result in the following HTML string:

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

## Related

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

[asts]: https://github.com/syntax-trees

[babel-handbook]: https://github.com/jamiebuilds/babel-handbook

[gatsby]: https://gatsbyjs.org

[gatsbyjs]: https://gatsbyjs.org

[hast]: https://github.com/syntax-trees/hast

[jamiebuilds]: https://github.com/jamiebuilds

[johno]: https://johno.com

[jsx]: https://reactjs.org/docs/jsx-in-depth.html

[mdast]: https://github.com/syntax-trees/mdast

[mdx-js]: https://github.com/mdx-js

[mdx]: https://mdxjs.com

[mdxast]: https://github.com/syntax-trees/mdxast

[nlcst]: https://github.com/syntax-trees/nlcst

[prettier]: https://prettier.io

[redotjs]: https://github.com/redotjs

[rehypejs]: https://github.com/rehypejs

[remarkjs]: https://github.com/remarkjs

[retextjs]: https://github.com/retextjs

[unist]: https://github.com/syntax-trees/unist

[wooorm]: https://github.com/wooorm
