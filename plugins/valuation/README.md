# 估值

读取 `custom "valuation"` 声明的不透明基金/投顾账户总市值：

- 在内存中生成虚拟商品、价格和盈亏；
- 支持多币种报价与估值换算；
- 不处理 `balance-ext`、`pad-ext` 或任何补差/余额扩展。

所有转换都发生在解析后的内存指令流中，不生成或改写 Bean 文件。BQL 查询、
报表和 Fava 会看到同一份转换结果。

## 启用

在 `benacount-local.yaml` 中启用：

```yaml
plugins:
  valuation:
    enabled: true
```

也可以使用 Fava 插件声明：

```beancount
plugin "fava.plugins.valuation"
```

为了兼容参考文档，`plugin "beancount_lazy_plugins.valuation"` 也会路由到
同一个插件。

## 界面配置

侧栏打开“估值”，点击“配置”标签页即可编辑全部配置：

- **估值账户**：账户、合成商品、报价货币、盈亏账户、启用状态；
- **高级**：只读查看即将写入的 JSON。

保存后写入 `plugins/valuation/config.json`，并立即用新配置重新计算页面和运行时
结果。编辑时会校验账户名、货币代码、重复账户和重复合成商品；有错误时
禁止保存。

### 账户映射

最小配置只需要账户：

```json
{
  "version": 1,
  "accounts": ["Assets:Valuation:CoolFund:Total"]
}
```

`currency` 留空时，从账户名推导。例如
`Assets:Valuation:CoolFund:Total` 会推导为 `COOL_FUND_USD`（报价货币为 USD 时）
和 `Income:Valuation:CoolFund:PnL`。`quote` 留空时使用账本主货币。

也可以显式配置：

```json
{
  "version": 1,
  "accounts": [
    {
      "account": "Assets:Valuation:CoolFund:Total",
      "currency": "COOL_FUND_USD",
      "pnlAccount": "Income:Valuation:CoolFund:PnL",
      "quote": "USD"
    }
  ]
}
```

两个启用账户不能映射到同一个合成商品；否则插件会报错并提示显式改名。

## 估值与多币种

```beancount
2024-01-10 * "Investing $1k in CoolFund"
  Assets:Physical:Cash  -1000.00 USD
  Assets:Valuation:CoolFund:Total  1000.00 USD

2024-02-10 custom "valuation" Assets:Valuation:CoolFund:Total 900 USD
```

插件会把基金账户的交易改成虚拟商品 `COOL_FUND_USD`，并按
“声明总市值 ÷ 当前份额”生成价格：

```text
2024-01-10 price COOL_FUND_USD 1 USD
2024-02-10 price COOL_FUND_USD 0.9 USD
```

账户市值因此是 `1000 × 0.9 = 900 USD`。卖出时按当前虚拟价格换回报价货币，
差额写入配置的 `pnlAccount`。

账户报价货币和交易货币可以不同，但买入/卖出 posting 必须能在报价货币下计量：

1. posting 自带的 `@` 价格（`posting.price`）；
2. posting 成本（`{...}`、`{{...}}` 或混合成本）折算出的每单位价格；
3. 都找不到时插件会报错并保留原 posting，提示先做换汇交易。

这样不会生成跨币种不平衡的交易。换汇本身仍应作为独立的交易记录。

例如用欧元买入美元计价的基金，可以用总成本锁定美元金额：

```beancount
2024-01-10 * "以欧元买入美元基金"
  Assets:Valuation:Cash  -1000.00 USD
  Assets:Valuation:GlobalFund:Total  800.00 EUR {{1000.00 USD}}
```

插件会先把 EUR 金额换算成账户报价货币 USD，再按虚拟价格增减合成份额。
卖出时同样支持 `@` 成交汇率；但同一商品若在账本其他位置已经使用成本记法，
Beancount 可能提示 cost / price-only 混用，建议在同一商品上统一记法。

估值金额可以使用其他货币，只要存在该日或更早的 `price` 指令；支持反向价格对。
例如：

```beancount
2024-01-15 price EUR 1.10 USD
2024-03-15 custom "valuation" Assets:Valuation:GlobalFund:Total 600 EUR
```

会先换算成 USD，再推导虚拟价格；页面同时显示原声明金额和换算汇率。

不同报价货币的账户分别汇总，不会把 USD/EUR 相加成 CNY。

## 示例

`examples/valuation-demo.bean` 已由 `main.bean` 显式 include，包含：

- USD、EUR、CNY 三个基金账户，按三种报价货币分别汇总；
- 欧元总成本买入美元基金的外币 posting 换算；
- 用 EUR 声明 USD 账户估值，再换算回报价货币；
- 部分赎回、已实现盈亏、赎回后再次估值；
- 注释中的空账户、非正估值、缺汇率、超额卖出等边界写法。

页面显示的计算来自同一套内存转换逻辑，不依赖额外数据库或缓存。

## 代码结构

- `frontend.tsx`：页面入口、数据加载、保存与标签页状态；
- `frontend/config.ts`、`frontend/types.ts`、`frontend/format.ts`：配置标准化、
  校验、类型和显示格式；
- `frontend/components/`：概览、账户卡片、账户编辑器和表单字段；
- `backend.ts`：GET/POST 路由与保存；
- `backend/view.ts`：读取 FileMap、解析账本、运行分析并组装页面视图。
