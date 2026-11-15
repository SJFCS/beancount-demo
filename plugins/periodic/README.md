# 摊销与折旧

摊销与折旧规则直接写在账本交易或 posting 的元数据里。插件读取元数据，
在内存中计算计划、图表和周期分录；不保存 JSON 配置，也不生成 Bean 文件。

## 工作方式

1. 原交易把可分摊金额记入待摊账户（如 `Assets:Prepayment:Rent`）、递延收入
   负债（如 `Liabilities:DeferredRevenue:Services`）或资产账户
   （如 `Assets:FixedAssets:Laptop`）。
2. 在需要分摊的 posting（或交易）上写 `amortize` / `depreciate` 元数据。
3. 插件页面读取元数据，展示规则、计划曲线和分期明细。
4. ledger 解析流水线在内存中物化周期分录；账本源文件不会被改写。

不再需要 `plugins/periodic/config.json`，也不再需要
`include "periodic/entries.bean"`。

## 基本示例

### 摊销年付房租

```beancount
2026-01-31 * "房东" "2026 年房租"
  Assets:Bank                                      -24000.00 CNY
  Expenses:Housing:Rent
    amortize: "1 Year /Monthly"
```

`Expenses:Housing:Rent` 是金额省略的 posting；插件会从另一条 posting
推断原始金额 `24000.00 CNY`。费用摊销默认把来源推导为
`Assets:Prepayment:<费用后缀>`。计划按月产生 12 期：

```beancount
2026-01-31 * "房东" "2026 年房租 · 1/12" #periodic
  Assets:Prepayment:Housing:Rent    -2000.00 CNY
  Expenses:Housing:Rent              2000.00 CNY

2026-02-28 * "房东" "2026 年房租 · 2/12" #periodic
  Assets:Prepayment:Housing:Rent    -2000.00 CNY
  Expenses:Housing:Rent              2000.00 CNY

; ... 直到 2026-12-31 · 12/12
```

原交易中带元数据的 posting 会在内存里改到来源账户
`Assets:Prepayment:Housing:Rent`，否则原交易和分期会重复计入费用。
如果确实想沿用权益清算账户，可在 posting 或交易上显式写
`source_account: "Equity:Amortization:Housing:Rent"`；权益账户只是 opt-in，
不再是默认值。

### 收入递延

```beancount
2026-01-01 * "客户" "年度服务费"
  Assets:Bank                                      12000.00 CNY
  Income:Services
    amortize: "1 Year /Monthly"
```

收入 posting 为负数时，默认来源是
`Liabilities:DeferredRevenue:Services`，目标仍是 `Income:Services`。原交易
先转入递延收入负债，之后每月生成“负债增加、收入确认”的分录：

```beancount
2026-01-01 * "客户" "年度服务费 · 1/12" #periodic
  Liabilities:DeferredRevenue:Services   1000.00 CNY
  Income:Services                       -1000.00 CNY
```

也可以把 `amortize` 直接写在 `Liabilities:` posting 上；此时来源就是该负债，
目标默认是 `Income:DeferredRevenue:<后缀>`。

### 折旧电脑

```beancount
2026-02-28 * "Apple" "MacBook Pro"
  Liabilities:CreditCard                         -12000.00 CNY
  Assets:FixedAssets:Laptop
    depreciate: "5 Year /Monthly =2000"
```

`5 Year /Monthly =2000` 表示：

- 总周期 5 年；
- 每月一期，共 60 期；
- 预计期末残值 `2000.00 CNY`；
- 可折旧金额为 `12000 - 2000 = 10000 CNY`，每期约 `166.67 CNY`，最后一期吸收尾差。

## 元数据语法

规则文本由空格分隔的片段组成，片段顺序可以调整：

```text
[原始金额-] [总周期] [@开始日期[~结束日期]] [/步长[!]] [*line] [=残值]
```

| 片段     | 含义                                    | 示例                         |
| -------- | --------------------------------------- | ---------------------------- |
| 原始金额 | 可选；缺省时取 posting 金额或可平衡金额 | `200000-`                    |
| 总周期   | 可选；缺省为 1 个月；支持小数年         | `1 Year`、`5Y`、`27.5 Year`  |
| 开始日期 | 可选；缺省为交易日期                    | `@2022-04-01`                |
| 结束日期 | 可选；与开始日期组成闭区间              | `@2022-07-26~2023-07-25`     |
| 步长     | 可选；缺省为每日                        | `/Monthly`、`/Daily`、`/12M` |
| `!`      | 按实际天数计算每期权重                  | `/Monthly!`                  |
| 公式     | 目前只支持直线法                        | `*line`                      |
| 残值     | 可选；缺省为 0；支持百分比              | `=2000`、`=20%`              |

支持的单位：`Day`、`Week`、`Month`、`Quarter`、`Year`，以及
`D`、`W`、`M`、`Q`、`Y` 简写。步长也接受 `Daily`、`Weekly`、`Monthly`、
`Quarterly`、`Yearly`。

```beancount
amortize: "1 Year /Monthly"
depreciate: "5 Year /Monthly =200"
depreciate: "5 Year /Monthly =20%"
depreciate: "27.5 Year /Yearly"
amortize: "@2022-07-26~2023-07-25 /Monthly"
amortize: "200000- 5 Years @2022-03-31 /Yearly =80000"
amortize: "5Y / 12M = 80000"
```

`27.5 Year` 等价于 330 个月的期末边界；能整除为整月时不做近似。其他小数月
按每月 30 天近似。周期最多 2400 期；原始金额最多 15 位数字；最多处理前 500
条规则，超出部分会单独报 issue，不再让整批规则失效。

### 期末不足一期

如果显式结束日期落在最后一个周期中间，最后一期按实际覆盖天数缩量，前面完整
期等额分摊。例如 `@2026-01-01~2026-06-15 /Monthly` 的 1200 元会生成 5 个
完整月加半个月：前 5 期各 `218.18`，最后一期 `109.10`。`/Monthly!` 仍然
启用逐期实际天数权重，不受这条默认逻辑影响。

## 账户如何确定

元数据写在哪个 posting 上很重要：

### 折旧

- 来源账户默认为带 `depreciate` 的 `Assets:` posting。
- 目标账户优先取 posting/交易上的 `expense_account`，其次取该资产
  `open` 指令上的 `depreciate_account`；都没有时使用
  `Expenses:Depreciation:<资产账户后缀>`。

```beancount
1900-01-01 open Assets:Car:ModelX CNY
  depreciate_account: "Expenses:Car:Value"
```

### 摊销

如果 `amortize` 写在 `Expenses:` posting 上：

- 目标账户就是该 posting；
- 来源账户优先取 `source_account` / `amortize_source`，否则使用
  `Assets:Prepayment:<费用账户后缀>`；
- 原交易中这个 posting 会在内存里转到来源账户。

如果 `amortize` 写在 `Assets:`、`Liabilities:` 或 `Equity:` posting 上：

- 来源账户就是该 posting；
- `Assets:` / `Equity:` 的目标账户优先取 `expense_account` /
  `amortize_account`，否则使用 `Expenses:Amortization:<来源账户后缀>`；
- `Liabilities:` 的目标默认是 `Income:DeferredRevenue:<后缀>`，也可显式指定
  `expense_account` 为 `Income:` 账户。

如果 `amortize` 写在 `Income:` posting 上：

- 目标账户就是该收入 posting；
- 来源账户优先取 `source_account`，否则使用
  `Liabilities:DeferredRevenue:<收入账户后缀>`；
- 原交易中的收入 posting 会转入递延收入负债。

也可以把账户显式写在 posting 或交易元数据上：

```beancount
amortize: "1 Year /Monthly"
source_account: "Assets:Prepayment:Rent"
expense_account: "Expenses:Housing:Rent"
```

`expense_account` 是历史字段名；收入递延场景可以把它写成 `Income:` 账户。
来源仍必须是 `Assets` / `Liabilities` / `Equity` / `Expenses`（折旧仅限
`Assets`），摊销目标必须是 `Expenses` 或 `Income`，并随 anchor 的账户类型
校验。

### 交易级规则

`amortize` / `depreciate` 也可以写在交易本身。交易级摊销按
`Expenses`、`Income`、`Equity`、`Liabilities`、`Assets` 的顺序选择唯一的
posting；同一根下有多个候选时要求显式指定。交易级折旧只在恰好一个 `Assets:`
posting 时自动选择，否则会报错，避免把银行账户误当固定资产。

显式指定使用交易元数据：

```beancount
2026-02-28 * "Apple" "MacBook Pro"
  depreciate: "5 Year /Monthly =20%"
  posting_account: "Assets:FixedAssets:Laptop"
  Liabilities:CreditCard                       -12000.00 CNY
  Assets:Bank                                  -12000.00 CNY
  Assets:FixedAssets:Laptop                     24000.00 CNY
```

`posting_index` 也受支持，使用 0 开始的 posting 下标；同时提供
`posting_account` 与 `posting_index` 时二者必须指向同一 posting。

规则涉及的账户如果尚未 `open`，会在内存解析流中临时补开 `open` 指令，不写入
账本文件；页面会列出这些账户。显式账户仍建议提前在账户文件中打开，便于分类和
后续对账。

## 残值到底有什么用

残值是计划结束时期末仍保留在来源账户上的账面价值，不是现金流，也不会自动
生成退款或卖出交易。

- **折旧**：残值表示预计转卖/回收价值。折旧总额 = 原始成本 − 残值。
  例如电脑 `12000`、预计卖 `2000`，只把 `10000` 折旧到费用。
- **摊销**：通常是 0。预付服务到期后没有可回收余额，就全部摊入费用。
  如果一笔预付款里包含“押金”，押金本身不是被消耗的服务成本，建议单独记到
  `Assets:Deposit`（或应收）账户，而不是放进摊销残值。
- **押一付一**：这是两笔现金流/资产，不是摊销残值。押金单独记资产；租金按
  租期摊销。只有确实需要在摊销结束时保留一部分在待摊账户里，才使用
  `=残值`。

最后一期会自动吸收四舍五入尾差，所以**计划余额**期末严格等于残值。若来源账户
就是原 posting（例如折旧资产），原 posting 的未分摊差额也会继续留在该账户，
此时账户余额是“未分摊差额 + 残值”。

显式 `total` 的语义如下：

- 缺省时 `total = 原 posting 金额`；
- `total < 原 posting 金额` 时，差额是未纳入计划的金额；
- 费用/收入 posting 需要转入来源账户时，插件会拆分原 posting：原账户保留
  `原金额 - total`，来源账户得到 `total`；
- 当来源账户就是原账户（资产折旧、负债递延）时不做 posting 拆分，计划只扣减
  `total - 残值`；
- `total > 原 posting 金额` 会报错。

例如原 posting 是 `24000`、规则写 `20000- 1 Year /Monthly =2000`：原费用
posting 保留 `4000`，待摊账户得到 `20000`，计划分摊 `18000`，期末待摊账户
保留 `2000`。页面会同时显示原 posting 金额和未分摊金额。

## 生成 posting 的属性

生成交易会继承原交易的 `tags`、`links` 和普通 transaction metadata，并额外
添加 `periodic` tag；`periodic-*` 内部字段会覆盖同名自定义键。生成 posting
会保留原 posting 的 `flag`、`cost`、`price`，并把除
`amortize` / `depreciate`、`filename`、`lineno` 外的 posting metadata 同时
复制到来源和目标 posting。原交易自身仍保留普通 metadata 和来源定位信息。

零金额期间不会生成 `0.00` 分录；极小额规则会把金额累积到后续非零期间，最后
一期吸收余额。

## 全局生成策略

生成范围是插件级设置，保存在 `benacount-local.yaml` 的
`plugins.periodic.generation_mode`，规则本身仍然只来自账本元数据。

```yaml
plugins:
  periodic:
    enabled: true
    generation_mode: "through_today"
```

| 值              | 行为                                     | 生成分录 flag                                     |
| --------------- | ---------------------------------------- | ------------------------------------------------- |
| `all`           | 一次生成全部期间，包括未来日期           | 继承原交易                                        |
| `through_today` | 只生成日期不晚于今天的期间；**默认值**   | 继承原交易                                        |
| `pending`       | 生成全部期间，今天之后的分录标记为未入账 | 今天及以前继承原交易；未来为 `!`（未入账/待确认） |

插件页面的“生成策略”控制器会修改这一全局设置。修改后下一次账本解析会按新策略
物化内存分录；不会写入任何生成 Bean 文件。

## 规则单独开关

每条摊销/折旧规则都可以单独停用。规则本身仍来自账本元数据，停用状态只作为
稀疏覆盖保存在 `benacount-local.yaml`：

```yaml
plugins:
  periodic:
    enabled: true
    generation_mode: "through_today"
    disabled_rules:
      "1a2b3c4d5e6f7890": true
```

键是由规则的元数据、日期、账户和金额派生的稳定配置键，可在页面展开规则后查看。
页面上的开关会自动新增或移除对应条目，不需要手工维护。

- 停用规则仍显示在“摊销规则”或“折旧规则”分组中，便于查看和重新启用。
- 停用后不生成该规则的分期分录，也不参与图表、统计和“下一期”。
- 原交易保持不动；如果账户只被停用规则使用，也不会为它临时补开账户。
- 修改规则的关键字段会改变配置键，旧停用条目不会影响新规则。

页面会同时展示摊销和折旧两个分组，不使用 Tab 或筛选器切换。

## 启用

`benacount-local.yaml`：

```yaml
plugins:
  periodic:
    enabled: true

navigation:
  routes:
    periodic:
      group: plugins
      position: first
      quick_menu: true
```

页面地址：

```text
/ledger/$ledgerOwner/$ledgerName/plugins/periodic
```

只读账本也可以查看规则和内存计划。

## 文件组织

- `backend.ts`：读取账本元数据、解析原始指令流并返回页面视图。
- `frontend.tsx`：页面组合。
- `frontend/schedule-chart.tsx`：原生 SVG 图表。
- `frontend/schedule-table.tsx`：分期明细。
- `frontend/use-periodic.ts`：读取与刷新状态。

共享的元数据解析、账户推导、精确分摊和运行时分录逻辑位于：

```text
ledger/src/foundation/rustledger/plugins/periodic.ts
```

页面支持夜间模式，跟随应用的主题设置自动切换配色。
