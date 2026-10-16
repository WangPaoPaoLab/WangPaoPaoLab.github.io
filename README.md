# WangPaoPaoLab.github.io

我的所有网站的总入口 —— 一个纯静态的导航/收录站。

**A single hub for every site I build.** Plain HTML, CSS and JavaScript, published with GitHub Pages. No server, no build step.

**Live:** https://wangpaopaolab.github.io

---

## 收录一个新站点 / Adding a site

只需要改一个文件：**`data/sites.json`**。往 `sites` 数组里加一条即可，页面会自动多出一张卡片。文件里现在只有 **1 条示例**（就是本站自己），照着它复制改写就行，不需要了直接删掉。

```json
{
  "title": { "en": "My new site",  "zh": "我的新网站" },
  "desc":  { "en": "What it does.", "zh": "它是做什么的。" },
  "url":   "https://wangpaopaolab.github.io/my-new-site/",
  "repo":  "https://github.com/WangPaoPaoLab/my-new-site",
  "category": "site",
  "tags": ["JavaScript", "tool"],
  "status": "live",
  "icon": "🚀",
  "featured": false
}
```

| 字段 | 说明 |
| --- | --- |
| `title` / `desc` | 必须同时写 `en` 和 `zh`，语言按钮切换的就是这两套文案 |
| `url` | 站点地址，必填（没有 `url` 的条目会被忽略） |
| `repo` | 仓库地址，可省略；省略后卡片上不显示 GitHub 图标 |
| `category` | 必须是 `categories` 里已有的 `id`，否则不会出现在分类筛选里 |
| `tags` | 纯展示用的标签 |
| `status` | `live` 已上线 / `wip` 建设中 / `archived` 已归档 |
| `icon` | 一个 emoji，省略则自动取标题首字 |
| `featured` | `true` 会排在所有卡片最前面 |

新增**分类**就在同一个文件的 `categories` 里加一项：

```json
{ "id": "game", "en": "Games", "zh": "小游戏" }
```

加完提交推送，一分钟左右生效：

```bash
git add data/sites.json
git commit -m "add: my new site"
git push
```

## 目录结构 / Structure

```
.
├── index.html              # 页面骨架（文案走 i18n，不直接写死）
├── 404.html
├── data/sites.json         # ★ 所有收录数据都在这里，唯一需要维护的文件
└── assets/
    ├── css/style.css       # 全部样式，主题色是顶部的 CSS 变量
    └── js/main.js          # 读取 JSON → 渲染卡片 / 搜索 / 筛选 / 语言 / 主题
```

没有构建步骤，没有依赖，也没有任何自动化 —— 收录什么、收录多少，完全看 `data/sites.json`。

## 功能 / Features

- **双语** —— 顶栏 `EN / 中` 一键切换，选择记在 `localStorage`，首次访问按浏览器语言自动判断
- **浅色 / 深色主题** —— 同样跟随系统并记住选择
- **实时搜索** —— 同时匹配中英文标题、描述、标签和网址，空格分词
- **分类筛选** —— 分类来自 `data/sites.json`，数量为 0 的分类自动隐藏
- **响应式** —— 手机、平板、桌面通吃

## 本地预览 / Local preview

因为页面用 `fetch` 读取 `data/sites.json`，**双击 `index.html` 打不开**（浏览器会拦截 `file://` 的 fetch），必须走 HTTP：

```bash
python -m http.server 8000
# 然后打开 http://localhost:8000
```

## 换配色 / Theming

改 `assets/css/style.css` 顶部 `:root` 里的变量即可，`--accent` 一处就能换掉全站主色；深色模式在下面的 `html[data-theme="dark"]` 里。

## License

MIT — see [LICENSE](LICENSE).
