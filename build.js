const fs = require('fs')
const remark = require('remark')
const toc = require('remark-toc')

const doc = fs.readFileSync('readme.md', 'utf8')

const result = remark()
  .use(toc, { tight: true })
  .processSync(doc)

fs.writeFileSync('readme.md', result.contents)
