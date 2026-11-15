# Ledger Canvas

**Ledger Canvas** 是一个在内存中整理、查询和观察账本数据的工作台。它在账本解析
完成后匹配交易，添加标签、元数据，或修改 `payee` / `narration`。不会改写任何
交易 Bean 文件，因此适合先快速试规则，再决定是否把稳定的映射落到源账本。
Query Rules 与 Mapping Rules 使用同一种 Preset 定义，但预设按工作区归类。查询在
映射后的交易流上既可以按商户聚合周期交易、推断间隔并估算年度金额，也可以把
交易字段与任意元数据映射为表头，按一个或多个表头分组并展开组内交易明细。

插件 ID 和作用域为 `ledger_canvas`，页面展示名称使用 Ledger Canvas。

插件由三部分组成：

- `frontend.tsx`：预设匹配编辑器、映射预览、时间/动作规则与周期查询看板。
- `backend.ts`：读取账本、生成可选值目录、校验配置并原子保存到本插件目录。
- `ledger/src/foundation/rustledger/plugins/ledger-canvas.ts`：真正的运行时
  转换，账本快照、Journal 和 BQL 都使用同一份转换后的指令流。

## 启用

本地插件页面通过 `benacount-local.yaml` 启用：

```yaml
plugins:
  ledger_canvas:
    enabled: true

navigation:
  routes:
    ledger_canvas:
      group: plugins
      position: last
      quick_menu: true
```

上面的 `enabled: true` 同时负责页面入口和解析期转换，不需要在 Bean 文件中声明
`plugin`。

配置分为两个文件独立保存：

- `presets.json`：可复用的匹配条件。
- `config.json`：全局启用状态、Preset 数据视图、映射规则动作与查询规则。

两个文件都会加入账本内容哈希，因此保存后不需要重启服务，下一次解析就会使用
新配置。配置错误只产生 `TS_LEDGER_CANVAS_CONFIG_INVALID` 警告并安全跳过，不会
改动原交易。旧版把 `presets` 和 `rules` 都写在 `config.json` 的配置仍可读取，
下次保存任意一侧时会自动迁移为分文件格式。

## 配置格式

`presets.json`：

```json
{
  "version": 1,
  "presets": {
    "netease-music": {
      "payee": "网易云音乐|网易云|NetEase Cloud Music"
    },
    "wechat-subscriptions": {
      "account": "^Expenses:Subscriptions",
      "tagPairs": [{ "key": "*", "value": "subscription*" }],
      "metaPairs": [
        { "key": "payment-provider", "value": "wechat" },
        { "key": "*", "value": "网易云音乐" }
      ]
    },
    "recurring": {
      "tagPairs": [{ "key": "*", "value": "recurring*" }]
    },
    "fire-recurring": {
      "metaPairs": [{ "key": "fire-expense-type", "value": "^周期性交易$" }]
    }
  },
  "presetScopes": {
    "netease-music": "mapping",
    "wechat-subscriptions": "mapping",
    "recurring": "query",
    "fire-recurring": "query"
  }
}
```

`config.json`：

```json
{
  "version": 1,
  "enabled": true,
  "rules": [
    {
      "id": "netease-music-subscription",
      "name": "网易云音乐会员",
      "enabled": true,
      "presetExpr": {
        "all": [
          { "preset": "netease-music" },
          {
            "any": [
              { "preset": "wechat-subscriptions" },
              { "preset": "alipay-subscriptions" }
            ]
          }
        ]
      },
      "time": "2026",
      "addTags": ["recurring"],
      "removeTags": ["temporary"],
      "addMeta": {
        "subscription-name": "网易云音乐",
        "recurring-period": "monthly"
      },
      "removeMeta": ["old-subscription-name"],
      "setPayee": "网易云音乐",
      "setNarration": "黑胶VIP 月度续费"
    }
  ],
  "queries": [
    {
      "id": "recurring-spend",
      "name": "周期性支出",
      "enabled": true,
      "preset": "recurring",
      "groupBy": "payee",
      "period": "auto",
      "periodMetaKey": "recurring-period"
    }
  ]
}
```

规则字段：

| 字段           | 含义                                                                  |
| -------------- | --------------------------------------------------------------------- |
| `preset`       | 兼容旧配置；引用单个预设。新配置推荐使用 `presetExpr`                 |
| `presetExpr`   | 预设表达式；`preset`、`all`、`any` 三选一，可嵌套                     |
| `time`         | 可选；Fava 时间范围，如 `2026`、`2026-01`、`2026-01-01 to 2026-12-31` |
| `addTags`      | 追加到 `tags` 的标签；会去重                                          |
| `removeTags`   | 从 `tags` 移除的标签；不存在的标签会忽略                              |
| `addMeta`      | 合并到交易元数据的键值；字符串、数字、布尔值或 `null`                 |
| `removeMeta`   | 从交易元数据移除的键列表；不存在的键会忽略                            |
| `setPayee`     | 替换运行时交易的 `payee`；原交易只有 `narration` 时会新增 `payee`     |
| `setNarration` | 替换运行时交易的 `narration`                                          |
| `enabled`      | 是否执行此规则                                                        |

规则可引用一个或多个 preset 并叠加时间，也可只设置时间范围。多个 preset
默认按 OR 组合：规则命中条件为“时间范围 AND（A OR B OR …）”。需要同时满足的
条件应放进同一个 Preset。新页面写入的多个预设使用 `presetExpr.any`：

```json
{
  "presetExpr": {
    "any": [{ "preset": "a" }, { "preset": "b" }]
  }
}
```

同一预设不能在一条规则表达式中重复引用。旧的单预设 `preset` 字段以及已有
`all` / 嵌套表达式继续兼容，但新页面不再创建规则级 AND 组合。规则只保存
Preset 引用，不直接保存账户、收款人、摘要、标签或元数据条件。
一个规则必须至少产生
`addTags`、`removeTags`、`addMeta`、`removeMeta`、`setPayee` 或
`setNarration` 中的一种效果。同一规则不能同时添加和移除同一个标签或元数据键。
规则按数组顺序执行：标签先移除再添加，元数据先合并再删除，后面的命中规则覆盖
同名元数据、`payee` 和 `narration`。
页面可拖动每条规则左侧的手柄调整执行顺序；聚焦手柄后也可使用 `↑` / `↓`。
搜索过滤规则时暂时禁用拖动，清空搜索后恢复。

页面把 Presets 分为 **Mapping Presets** 与 **Query Presets** 两栏，分类显式
保存在 `presets.json` 的 `presetScopes`。未被任何规则引用的预设可通过卡片上的
双向箭头在两类之间转换；一旦被规则引用，类型切换按钮就会禁用，必须先解除所有
引用并保存规则。Mapping Rules 只能选择 Mapping Presets，Query Rules 只能选择
Query Presets。Presets、Rules 与 Preview 的三组标签页联动，切换任意一处会同步
切换整个工作区。Presets 与 Rules 各自有保存按钮。规则只能引用已保存的预设；
修改预设后需要先保存预设，再保存规则。预设重命名会同步更新已保存规则的引用，
但仍被规则引用的预设需要先解除引用后才能删除。旧配置中的跨工作区引用仍会显示
范围失配警告，修正引用或把预设移回原工作区后才能保存规则。

每个 Preset 卡片都有独立的**数据视图**，保存在 `config.json` 的
`presetViews`。数据视图只影响该 Preset 的匹配预演、选择器和“账本匹配内容”，
不改变 Rules 的实际执行状态：

```json
{
  "version": 1,
  "presetViews": {
    "recurring": {
      "mode": "mapped",
      "disabledRuleIds": ["rule-2"]
    }
  },
  "rules": [],
  "queries": []
}
```

`mode: "raw"` 使用原始交易；`mode: "mapped"` 按当前 Mapping Rules 顺序重放，
并跳过 `disabledRuleIds` 中的规则。因此可以用任意规则组合复现 Preset 编写时
想验证的中间状态。Mapping Presets 默认使用原始交易；Query Presets 默认使用
全部映射后的交易。禁用列表仅属于 Preset 的展示配置，不会覆盖规则自身的
`enabled` 字段。账户、收款人、摘要、标签和元数据这五类下拉选择器都读取同一
数据视图生成的候选目录，而不是始终读取原始账本；切换视图时会标明候选目录仍在
刷新，下拉仍可打开。若已有最近一次同视图快照会暂时保留，但映射后视图绝不会
回退到原始数据。新视图没有候选值时，下拉会显示空态，可切换数据视图或在下方
手动填写。该字段只从 `config.json` 读取，`presets.json` 中的同名旧字段会被
忽略。新 Preset 尚未填写匹配条件时，页面仍会用当前已完成的 Mapping Rules
生成只读候选目录，因此可以先查看映射后的标签、元数据和规范化字段，再编写条件。

旧配置没有 `presetScopes` 时会自动推导：只被查询规则引用的预设归入 Query
Presets，其余归入 Mapping Presets；保存后写入显式的 `presetScopes`。

## 查询规则与分组周期估算

Query Rules 与 Mapping Rules 一起保存在 `config.json` 的 `queries` 数组。查询
不会改写交易，而是在映射规则执行后读取最终运行时的 `tags`、元数据、`payee` 和
posting 账户。因此可以先由映射规则写入 `#recurring`，再让查询规则匹配这个标签：

```json
{
  "id": "recurring-spend",
  "name": "周期性支出",
  "enabled": true,
  "presetExpr": {
    "any": [{ "preset": "recurring" }, { "preset": "fire-recurring" }]
  },
  "mode": "table",
  "columns": [{ "id": "merchant", "label": "商户", "source": "payee" }],
  "groupByColumns": ["merchant"],
  "period": "auto",
  "periodMetaKey": "recurring-period"
}
```

查询字段：

| 字段             | 含义                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| `preset`         | 兼容旧配置；引用单个 Preset                                                  |
| `presetExpr`     | 与映射规则相同的 Preset 表达式                                               |
| `time`           | 可选；限制计算范围                                                           |
| `mode`           | 当前产品使用 `table`；`recurring` 仅用于兼容旧配置                           |
| `groupBy`        | 旧版 `recurring` 查询的分组字段，页面会将它迁移为分组表头                    |
| `groupMetaKey`   | 旧版元数据分组键                                                             |
| `period`         | `none`、`auto`、`weekly`、`monthly`、`quarterly`、`semiannual` 或 `yearly`   |
| `periodMetaKey`  | 自动模式读取的周期元数据键                                                   |
| `columns`        | 数据表表头定义；每列由 `id`、`label`、`source` 和可选 `metaKey` 组成         |
| `groupByColumns` | 数据表的分组表头 ID 列表；可以不选，此时生成一行全量汇总                     |

Query Rules 实际运行时始终在全部 Mapping Rules 执行后的交易流上匹配，商户分组
和 `groupMetaKey` 也读取映射后的字段，因此查询可以使用映射规则新增的标签、
元数据及规范化后的 `payee`。Query Presets 卡片默认也预览映射后数据；需要检查
原始字段或某个中间 Mapping 状态时，可单独切换该 Preset 的数据视图。

每个查询只有一种输出形态：**分组数据表**。把交易字段或元数据键映射为表头，
选择一个或多个表头作为分组键。每行汇总交易数、日期范围（含首尾天数）和各币种
花费；展开行可查看逐笔交易、收款人、摘要、标签与该笔花费。组内非分组列存在
多个值时以标签列出，不隐式取第一个值。

分组表同时支持周期估算。`period: "auto"` 会根据每个分组自己的交易日期或
`periodMetaKey` 推断周期，并在表中增加“周期”和“预计年度”两列。按商户分组时
这就是原来的周期分析；按地点、开始日期等任意表头分组时也是同一套能力。旅行、
项目等非周期性分组可以把 `period` 设为 `"none"`，只保留分组汇总，避免产生
没有业务意义的年化金额。旧版 `recurring` 查询会在页面载入时自动转换为等价的
分组表，并保留原周期设置。

数据表的 `source` 支持 `date`、`payee`、`narration` 和 `meta`。只有 `meta`
列需要 `metaKey`。例如地点和开始日期保存为交易元数据，按两者分组：

```json
{
  "id": "trip-locations",
  "name": "旅行地点",
  "enabled": true,
  "time": "2026",
  "mode": "table",
  "period": "none",
  "columns": [
    {
      "id": "location",
      "label": "地点",
      "source": "meta",
      "metaKey": "location"
    },
    {
      "id": "start",
      "label": "开始日期",
      "source": "meta",
      "metaKey": "start-date"
    },
    { "id": "merchant", "label": "商户", "source": "payee" }
  ],
  "groupByColumns": ["location", "start"]
}
```

上例会生成“地点 + 开始日期”的每一行，`商户` 列列出该组内的所有商户。如果只想
按地点分组，把 `groupByColumns` 改为 `["location"]` 即可；组内的多个开始日期
会显示为多个值，而不会被静默覆盖。表头顺序就是 `columns` 数组顺序，页面也支持
上移 / 下移；分组键顺序同样按 `groupByColumns` 的顺序。

自动模式先读取 `periodMetaKey`，值支持 `weekly`、`monthly`、`quarterly`、
`yearly`、`30d`、`2 weeks` 等写法；没有可用元数据时，用同一分组交易日期
间隔的中位数推断周期。每组列出最早 / 最近日期、间隔、单次均值、累计金额和
预计年度金额。少于两个不同日期且没有固定周期或周期元数据时，不会伪造年化结果。

金额优先取 `Expenses:` postings 的净额；没有支出 posting 时，取该币种绝对值
最大的单条 posting。不同币种分别汇总，不进行隐式汇率换算。预览最多展示每组
前 200 笔明细，但分组命中和年化统计始终使用全部匹配交易。

查询结果出现在 Preview 区域的 **Query Preview** 标签页。分组表按所选表头生成
可展开的结果，并按周期设置附加推断与年度金额，适合核对 `#recurring`、
`fire-expense-type=周期性交易`，以及 `location` / `start-date` 等自定义元数据。

## 预设编辑与预览

- 每个预设都会显示命中的交易总数，并可展开查看交易日期、payee、摘要、标签、
  元数据和账户。卡片可切换原始数据与映射后数据；映射后视图可逐条启用或停用
  Mapping Rules，以验证任意中间状态。
- 规则编辑区下方有独立的 Preview 区域，通过 Mapping Preview 与 Query Preview
  两个标签页切换；Mapping Preview 中每条规则折叠展示，展开后按“原来 / 添加后”
  两列查看命中交易的字段差异。
- 每张规则预览卡片独立切换“只看差异 / 全部字段”，默认隐藏未变化字段，并分别
  高亮移除值与添加值。收款人、摘要、标签、元数据与账户差异都使用同一套 diff
  标记。
- 预览卡片按账户结构自动标记付款、收款、账户流转与混合交易，并用不同卡色区分。
  卡片右上角始终显示交易金额与币种，多币种交易会并列展示。
- 预设条件独立保存为 `presets.json`；规则引用只显示预设名称，不展开复述条件。
- 删除 Mapping Rule 会同步清理 `config.json` 中 `presetViews` 对它的模拟禁用
  引用，随后保存 Rules 即可。Preset 若仍被已保存或当前草稿中的规则引用，删除
  与类型切换按钮会锁定，重命名会被拒绝；解除引用并保存 Rules 后恢复。
- Mapping Rules 直接添加多个 Preset 引用，默认按 OR 组合；无法在规则层再
  添加账户、收款人、摘要、标签或元数据条件。
- 正向 / 排除和每一行的 AND / OR 都在 Preset 内设置；Mapping Rules
  只负责引用、时间和动作。
- 页面修改完成后会防抖调用后端预览接口，不保存文件也能看到即时命中结果。
- 账户可从按 Assets / Liabilities / Equity / Income / Expenses 分层的账户树中选择。
- 收款人、摘要、标签和 metadata 可从账本已观察值中搜索、分类和复选。
- 移除标签和移除元数据的选择器支持一键全选当前列表或搜索结果。
- 匹配类型与“选择添加”在同一行；表达式下方显示可读的匹配语句和当前账本中
  能命中的已观察内容，不需要先保存才能确认条件是否写对。
- 时间范围同时支持文本输入和日历选择，快捷项包括本月、上月、本季度、今年和最近
  12 个月。
- 结构化与 Fava Advanced Filter 可切换编辑。切换会转换当前内容；无法无损结构化
  的 DSL（例如金额或复杂嵌套条件）会显示提示并保留原文，不会被空内容覆盖。
- 高级 DSL 会在切入、失焦和点击“格式化”时按括号、AND 与 OR
  自动换行缩进；格式化只改变空白，不修改模式字符串。

Mapping Preview 使用规则自身的 `time` 范围，并显示范围天数及执行当前规则前后的
交易差异；Query Preview 显示由表头驱动的分组数据表，按交易日期显示含首尾天数，
并按需计算每个分组的周期与年度金额。

## 结构化 filter

所有文本条件默认不区分大小写。同一个字段传入数组时，候选值之间始终是“任一
命中”。每个条件卡片分别保存它与上一条件的关系以及是否排除；标签、元数据的
每一行也分别有 `join` 与 `exclude`。条件按“账户 → 收款人 → 摘要 → 标签 →
元数据 → 任意文本”的顺序计算，其中“任意文本”是最后执行的兜底条件。匹配表达式
有三种写法：

| 写法                 | 行为                                                       |
| -------------------- | ---------------------------------------------------------- |
| `regex:foo.*`        | 强制正则                                                   |
| `glob:foo*`          | 强制通配符；`*` 匹配任意长度，`?` 匹配一个字符             |
| 普通 `foo*` / `foo?` | 没有正则符号时自动按通配符；`foo.*` 等明显正则仍按正则处理 |

正则使用 JavaScript 的 `iu` 语义。通配符会自动转换为完整匹配，例如
`NetEase*` 等价于 `^NetEase.*$`。需要在通配符里匹配字面量 `*` 或 `?` 时写成
`\*` / `\?`。

| 字段             | 匹配范围                                               |
| ---------------- | ------------------------------------------------------ |
| `account`        | 任一 posting 账户                                      |
| `payee`          | 交易的 `payee`                                         |
| `narration`      | 交易的 `narration`                                     |
| `any`            | payee、narration、tags 和全部元数据                    |
| `tags`           | 兼容旧配置：交易已有标签，精确匹配                     |
| `tagPairs`       | 标签键值条件；键 `*` 表示任意标签，值支持正则 / 通配符 |
| `tagMode`        | 兼容旧配置；新配置使用每条记录的 `join`                |
| `meta`           | 兼容旧配置：明确元数据键                               |
| `metaPairs`      | 元数据键值列表；键 `*` 表示任意用户元数据键            |
| `metaMode`       | 兼容旧配置；新配置使用每条记录的 `join`                |
| `conditionLogic` | 每个条件组独立的 `join: "and" \| "or"` 与 `exclude`    |
| `matchMode`      | 兼容旧配置；新配置使用 `conditionLogic`                |

`meta` 的字符串值支持正则 / 通配符；数字精确匹配字符串形式，布尔和 `null`
精确匹配。`metaPairs` 允许同一个键出现多次，也允许键使用正则或通配符。

```json
{
  "account": "^Expenses:Travel$",
  "payee": "^Personal$",
  "conditionLogic": {
    "payee": { "join": "and", "exclude": true }
  },
  "tagPairs": [
    { "key": "*", "value": "^subscription$", "join": "and" },
    { "key": "*", "value": "^refund$", "join": "and", "exclude": true }
  ]
}
```

上例表示：账户命中旅游支出，且收款人不是 Personal，且标签满足 subscription
而不是 refund。页面公式会同步显示条件关系。

标签本身是 Beancount 的一维字符串。为了支持 KV 条件，标签写成
`key:value` 或 `key=value` 时会先拆成键和值；没有分隔符时，键和值都视为完整
标签。因此：

- `{ "key": "*", "value": "recurring*" }` 匹配任意以 recurring 开头的标签。
- `{ "key": "subscription", "value": "*" }` 匹配 `#subscription`。
- `{ "key": "subscription", "value": "monthly" }` 匹配
  `#subscription:monthly` 或 `#subscription=monthly`。

预设可以直接使用 Fava Advanced Filter 字符串。结构化编辑器和 DSL 编辑器在页面
中可以互相切换。例如，一个微信订阅预设写成 DSL 后，规则只负责时间与动作：

```json
{
  "preset": "wechat-subscriptions",
  "time": "2026",
  "addTags": ["subscription-2026"]
}
```

对应的 `presets` 可以写成 `"#subscription payment-provider:wechat"`。

## 收款人与摘要映射

导入账单的收款人或摘要经常带分店、订单前缀或不稳定后缀。分别用 `payee` 或
`narration` 做宽容匹配，再用 `setPayee` / `setNarration` 输出统一的收款人或
摘要，并用 `subscription-name` 等元数据供后续面板聚合。原始 Bean 不会被修改。

如需明确周期，可在 `addMeta` 中写入 `"recurring-period": "monthly"` 等元数据；
查询规则会优先读取该值。没有该值时，查询预览会根据命中日期推断间隔。

## 验证

```sh
node ledger/node_modules/typescript/bin/tsc -p beancount/private/plugins/tsconfig.frontend.json
node ledger/node_modules/typescript/bin/tsc -p beancount/private/plugins/tsconfig.backend.json
cd ledger && yarn test --runInBand \
  src/foundation/rustledger/plugins/__tests__/ledger-canvas.test.ts \
  src/local/__tests__/ledger-canvas.test.ts
```
