# unified handbook

**:warning: This is a work in progress**

The compiler for your content.

This handbook describes the unified ecosystem. It goes in depth about the numerous
syntaxes it supports, usage, and practical guides on writing plugins. Additionally,
it will attempt to define murky, computer science-y concepts that unified attempts
to abstract away.

## Table of contents

-   [Introduction](#introduction)

-   [How does it work?](#how-does-it-work)

-   [Supported syntaxes](#supported-syntaxes)

-   [Abstract syntax trees](#abstract-syntax-trees)

    -   [Constructing an AST](#constructing-an-ast)

        -   [Parse example](#parse-example)

-   [Tree traversal](#tree-traversal)

    -   [Breadth-first traversal](#breadth-first-traversal)
    -   [Depth-first traversal](#depth-first-traversal)

-   [unist](#unist)

    -   [Motivation](#motivation)

    -   [unist-util-visit](#unist-util-visit)

    -   [unist-util-remove](#unist-util-remove)

    -   [Advanced operations](#advanced-operations)

        -   [Removing nodes based on parent context](#removing-nodes-based-on-parent-context)

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

-   [Glossary](#glossary)

    -   [Tree](#tree)
    -   [Child](#child)
    -   [Parent](#parent)
    -   [Index](#index)
    -   [Sibling](#sibling)
    -   [Root](#root)
    -   [Descendant](#descendant)
    -   [Ancestor](#ancestor)
    -   [Head](#head)
    -   [Tail](#tail)
    -   [Leaf](#leaf)
    -   [Branch](#branch)
    -   [Generated](#generated)
    -   [Type](#type)
    -   [Positional information](#positional-information)
    -   [File](#file)
    -   [Preorder](#preorder)
    -   [Postorder](#postorder)
    -   [Enter](#enter)
    -   [Exit](#exit)

-   [Authors](#authors)

-   [Additional resources](#additional-resources)

-   [Acknowledgements](#acknowledgements)

-   [License](#license)

## Introduction

**unified** enables new exciting projects like [Gatsby][] to pull in Markdown,
[MDX][] to embed [JSX][], and [Prettier][] to format it. It’s used in about 300k
projects on GitHub and has about 10m downloads each month on npm: you’re probably
using it.

It powers [remarkjs][], [rehypejs][], [mdx-js][], [retextjs][], and [redotjs][]. It's
used to build other projects like [prettier][], [gatsbyjs][], and more.

Some notable users are [Node.js][], [ZEIT][],  [Netlify][], [GitHub][], [Mozilla][],
[WordPress][], [Adobe][], [Facebook][], [Google][].

## How does it work?

unified uses [abstract syntax trees][asts], or ASTs, that plugins can operate on. It
can even process between different formats. This means you can parse a markdown document,
transform it to HTML, and then transpile back to markdown.

unified leverages a syntax tree specification (called [unist][] or UST) so that utilities
can be shared amongst different formats. In practice, you can use `unist-util-visit` to visit
nodes **using the same library with the same API** on any supported AST.

```js
visit(markdownAST, 'images', transformImages)
visit(htmlAST, 'img', transformImgs)
```

## Supported syntaxes

unified supports a few different syntaxes. Each have their own formal specification and are
compatible with all `unist` utility libraries.

-   **[mdast][]**/**[remarkjs][]**: Markdown
-   **[hast][]**/**[rehypejs][]**: HTML
-   **[nlcst][]**/**[retextjs][]**: Natural language
-   **[mdxast][]**/**[mdx-js][]**: MDX

Each syntax has its own GitHub organization and subset of plugins and libraries.

## Abstract syntax trees

An abstract syntax tree, or AST, is a representation of input. It's an abstraction that
enables developers to analyze, transform and generate code.

They're the integral data structure in the unified ecosystem. Most plugins operate solely
on the AST, receiving it as an argument and then returning a new AST afterwards.

Your most basic plugin looks like the following (where the tree is an AST):

```js
module.exports = options => tree => {
  return tree
}
```

It accepts the AST as an argument, and then returns it. You can make it do
something slightly more interesting by counting the heading nodes.

```js
const visit = require('unist-util-visit')

module.exports = options => tree => {
  let headingsCount = 0

  visit(tree, 'heading', node => {
    headingsCount++
  })
}
```

Or, turn all `h1`s in a document into `h2`s:

```js
const visit = require('unist-util-visit')

module.exports = options => tree => {
  visit(tree, 'heading', node => {
    if (node.depth === 1) {
      node.depth = 2
    }
  })
}
```

If you ran the plugin above with `# Hello, world!` and compiled it
back to markdown, the output would be `## Hello, world!`.

unified uses ASTs because plugins are much easier to write when operating
on objects rather than the strings themselves. You could achieve the same
result with a string replacement:

```js
markdown.replace(/^#\s+/g, '## ')
```

But this would be brittle and doesn't handle the thousands of edgecases
with complex grammars which make up the syntax of markdown, HTML, and
MDX.

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

## Tree traversal

Tree traversal is a common task when working with a [_tree_][term-tree] to
search it.
Tree traversal is typically either _breadth-first_ or _depth-first_.

In the following examples, we’ll work with this tree:

```ascii
                 +---+
                 | A |
                 +-+-+
                   |
             +-----+-----+
             |           |
           +-+-+       +-+-+
           | B |       | F |
           +-+-+       +-+-+
             |           |
    +-----+--+--+        |
    |     |     |        |
  +-+-+ +-+-+ +-+-+    +-+-+
  | C | | D | | E |    | G |
  +---+ +---+ +---+    +---+
```

### Breadth-first traversal

**Breadth-first traversal** is visiting a node and all its
[_siblings_][term-sibling] to broaden the search at that level, before
traversing [_children_][term-child].

For the syntax tree defined in the diagram, a breadth-first traversal first
searches the root of the tree (**A**), then its children (**B** and **F**), then
their children (**C**, **D**, **E**, and **G**).

### Depth-first traversal

Alternatively, and more commonly, **depth-first traversal** is used.
The search is first deepened, by traversing [_children_][term-child], before
traversing [_siblings_][term-sibling].

For the syntax tree defined in the diagram, a depth-first traversal first
searches the root of the tree (**A**), then one of its children (**B** or
**F**), then their children (**C**, **D**, and **E**, or **G**).

For a given node _N_ with [_children_][term-child], a **depth-first traversal**
performs three steps, simplified to only binary trees (every node has
[_head_][term-head] and [_tail_][term-tail], but no other children):

-   **N**: visit _N_ itself
-   **L**: traverse [_head_][term-head]
-   **R**: traverse [_tail_][term-tail]

These steps can be done in any order, but for non-binary trees, **L** and **R**
occur together.
If **L** is done before **R**, the traversal is called _left-to-right_
traversal, otherwise it is called _right-to-left_ traversal.
In the case of non-binary trees, the other children between _head_ and _tail_
are processed in that order as well, so for _left-to-right_ traversal, first
_head_ is traversed (**L**), then its _next sibling_ is traversed, etcetera,
until finally _tail_ (**R**) is traversed.

Because **L** and **R** occur together for non-binary trees, we can produce four
types of orders: NLR, NRL, LRN, RLN.

NLR and LRN (the two _left-to-right_ traversal options) are most commonly used
and respectively named [_preorder_][term-preorder] and
[_postorder_][term-postorder].

For the syntax tree defined in the diagram, _preorder_ and _postorder_ traversal
thus first search the root of the tree (**A**), then its head (**B**), then its
children from left-to-right (**C**, **D**, and then **E**).
After all [_descendants_][term-descendant] of **B** are traversed, its next
sibling (**F**) is traversed and then finally its only child (**G**).

## unist

unist is a specification for syntax trees which ensures that libraries that work with
unified are as interoperable as possible. **All ASTs in unified conform to this spec**.
It's the bread and butter of the ecosystem.

### Motivation

A standard AST allows developers to use the same visitor function on all formats, whether
it's markdown, HTML, natural language, or MDX. Using the same library ensures that the core
functionality is as solid as possible while cutting down on cognitive overhead when trying
to perform common tasks.

### unist-util-visit

unist-util-visit is a library that improves the DX of tree traversal
for unist trees. It's a function that takes a tree, a node type, and
a callback which it invokes with any matching nodes that are found.

```js
visit(tree, 'image', node => {
  console.log(node)
})
```

### unist-util-remove

### Advanced operations

Once you're familiar with some of the primary unist utilities, you can
combine them together to address more complex needs.

#### Removing nodes based on parent context

In some cases you might want to remove nodes based on their parent context. Consider
a scenario where you want to remove all images contained within a heading.

You can achieve this by combining unist-util-visit with unist-util-remove. The idea
is that you first visit the parent, which would be heading nodes, and then remove
images from the subtree.

```js
visit(tree, 'heading', headingNode => {
  remove(headingNode, 'image')
})
```

[Watch this lesson on egghead →](https://egghead.io/lessons/javascript-remove-markdown-nodes-from-a-document-with-unist-util-remove)

### unist resources

-   [Read more about unist →](https://github.com/syntax-tree/unist)
-   [See the list of unist utilities →](https://github.com/syntax-tree/unist/blob/master/readme.md#utilities)

## unified

unified is the interface for working with syntax trees and can be used in the same way
for any of the supported syntaxes.

For unified to work it requires two key pieces: a parser and a compiler.

### Parser

A parser takes a string and tokenizes it based on syntax. A markdown parser would
turn `# Hello, world!` into a `heading` node.

unified has a parser for each of its supported syntax trees.

### Compiler

A compiler turns an AST into its "output". This is typically a string. In some cases
folks want to parse a markdown document, transform it, and then write back out markdown
(like Prettier). In other cases folks might want to turn markdown into HTML.

unified already supports compilers for most common outputs including markdown, HTML,
text, and MDX. It even offers compilers for less common use cases including compiling
markdown to CLI manual pages.

### Transpiler

unified also offers transpilers. This is how one syntax tree is converted to another format.
The most common transpiler is `mdast-util-to-hast` which converts the markdown AST (mdast)
to the HTML AST (hast).

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

A more real-world example might want to turn a markdown document into an HTML string which
would look something like:

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

unified was originally created by [Titus Wormer][wooorm]. It's now governed by a collective
which handles the many GitHub organizations, repositories, and packages that are part of the
greater unified ecosystem.

The collective and its governance won't be addressed in this handbook. If you're interested,
you can [read more about the collective](https://github.com/unifiedjs/collective)
on GitHub.

## Glossary

### Tree

A **tree** is a node and all of its [_descendants_][term-descendant] (if any).

### Child

Node X is **child** of node Y, if Y’s `children` include X.

### Parent

Node X is **parent** of node Y, if Y is a [_child_][term-child] of X.

### Index

The **index** of a [_child_][term-child] is its number of preceding
[_siblings_][term-sibling], or `0` if it has none.

### Sibling

Node X is a **sibling** of node Y, if X and Y have the same
[_parent_][term-parent] (if any).

The **previous sibling** of a [_child_][term-child] is its **sibling** at its
[_index_][term-index] minus 1.

The **next sibling** of a [_child_][term-child] is its **sibling** at its
[_index_][term-index] plus 1.

### Root

The **root** of a node is itself, if without [_parent_][term-parent], or the
**root** of its [_parent_][term-parent].

The **root** of a [_tree_][term-tree] is any node in that [_tree_][term-tree]
without [_parent_][term-parent].

### Descendant

Node X is **descendant** of node Y, if X is a [_child_][term-child] of Y, or if
X is a [_child_][term-child] of node Z that is a **descendant** of Y.

An **inclusive descendant** is a node or one of its **descendants**.

### Ancestor

Node X is an **ancestor** of node Y, if Y is a [_descendant_][term-descendant]
of X.

An **inclusive ancestor** is a node or one of its **ancestors**.

### Head

The **head** of a node is its first [_child_][term-child] (if any).

### Tail

The **tail** of a node is its last [_child_][term-child] (if any).

### Leaf

A **leaf** is a node with no [_children_][term-child].

### Branch

A **branch** is a node with one or more [_children_][term-child].

### Generated

A node is **generated** if it does not have [_positional
information_][term-positional-info].

### Type

The **type** of a node is the value of its `type` field.

### Positional information

The **positional information** of a node is the value of its `position` field.

### File

A **file** is a source document that represents the original file that was
parsed to produce the syntax tree.
[_Positional information_][term-positional-info] represents the place of a node
in this file.
Files are provided by the host environment and not defined by unist.

For example, see projects such as [**vfile**][vfile].

### Preorder

In **preorder** (**NLR**) is [depth-first][traversal-depth] [tree
traversal][traversal] that performs the following steps for each node _N_:

1.  **N**: visit _N_ itself
2.  **L**: traverse [_head_][term-head] (then its _next sibling_, recursively
    moving forward until reaching _tail_)
3.  **R**: traverse [_tail_][term-tail]

### Postorder

In **postorder** (**LRN**) is [depth-first][traversal-depth] [tree
traversal][traversal] that performs the following steps for each node _N_:

1.  **L**: traverse [_head_][term-head] (then its _next sibling_, recursively
    moving forward until reaching _tail_)
2.  **R**: traverse [_tail_][term-tail]
3.  **N**: visit _N_ itself

### Enter

**Enter** is a step right before other steps performed on a given node _N_ when
[**traversing**][traversal] a tree.

For example, when performing _preorder_ traversal, **enter** is the first step
taken, right before visiting _N_ itself.

### Exit

**Exit** is a step right after other steps performed on a given node _N_ when
[**traversing**][traversal] a tree.

For example, when performing _preorder_ traversal, **exit** is the last step
taken, right after traversing the [_tail_][term-tail] of _N_.

## Authors

-   [John Otander][johno]
-   [Titus Wormer][wooorm]

## Additional resources

-   [AST Explorer](https://astexplorer.net)
-   [MDX Playground](https://mdxjs.com/playground)

## Acknowledgements

This handbook is inspired by the [babel-handbook][] written by
[James Kyle][jamiebuilds].

## License

[MIT](https://github.com/unifiedjs/handbook/license)

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

[term-tree]: #tree

[term-preorder]: #preorder

[term-postorder]: #postorder

[term-child]: #child

[term-parent]: #parent-1

[term-index]: #index

[term-sibling]: #sibling

[term-descendant]: #descendant

[term-head]: #head

[term-tail]: #tail

[term-generated]: #generated

[term-type]: #type

[term-positional-info]: #positional-information

[term-file]: #file

[unist]: https://github.com/syntax-tree/unist

[vfile]: https://github.com/vfile/vfile

[wooorm]: https://github.com/wooorm
