# 投资组合收益

在账本页面中计算投资组合的市值、成本、盈亏、时间加权收益、XIRR、最大回撤和
分红。插件参考
[fava-portfolio-returns](https://github.com/andreasgerstmayr/fava-portfolio-returns)
的指标口径，但配置完全由本插件的界面维护。

## 配置位置

插件只读写自己的配置文件：

```text
plugins/portfolio_returns/config.json
```

配置不会写入 `main.bean`，也不会生成或读取 `custom "beangrow"`、
`custom "portfolio_returns"` 等 Beancount 指令。首次点击“保存配置”时文件会自动
创建；`benacount-local.yaml` 只负责启用插件和出现在侧边栏，不保存投资账户明细。

在 `benacount-local.yaml` 中启用：

```yaml
plugins:
  portfolio_returns:
    enabled: true

navigation:
  routes:
    portfolio_returns:
      group: plugins
      position: first
      quick_menu: true
```

## 配置示例

```json
{
  "version": 1,
  "baseCurrency": "CNY",
  "investments": [
    {
      "id": "inv-1",
      "name": "VOO",
      "assetAccount": "Assets:Brokerage:VOO",
      "commodity": "VOO",
      "cashAccounts": ["Assets:Brokerage:Cash"],
      "dividendAccounts": ["Income:Brokerage:VOO:Dividend"],
      "enabled": true
    }
  ],
  "groups": [
    {
      "id": "grp-1",
      "name": "美股",
      "investmentIds": ["inv-1"]
    }
  ],
  "display": {
    "pnlColorScheme": "green-red",
    "defaultRange": "1Y"
  }
}
```

`id` 必须以小写字母开头，只能包含小写字母、数字、下划线和连字符。

## 投资账户

- **资产账户 + 商品**：决定哪个账户中的哪种商品属于这笔投资。例如
  `Assets:Brokerage:VOO` 中的 `VOO`。同一资产账户可以配置不同商品，但同一
  “资产账户 + 商品”组合只能出现一次。
- **现金账户**：可选。买入、卖出、费用和分红产生的现金变化从这里读取。建议为
  投资专用一个现金账户，例如 `Assets:Brokerage:Cash`，避免普通消费流水混入。
  留空时，插件会从同一笔交易的其他资产或负债账户推断现金流。
- **分红账户**：通常填写 `Income:...:Dividend`。交易中只要出现该账户，相关现金
  流入就会标记为分红；现金分红再投资也会同时生成分红和再投资现金流。
- **禁用账户**：`enabled: false` 的账户不会出现在默认报表和筛选器中，但配置仍然
  保留。

“配置”页可以根据账本中已有的资产持仓生成建议，并自动猜测现金账户和分红账户。
添加建议后仍应逐项检查，尤其是现金账户。

报表中的“市值”只统计配置的资产账户持仓，现金账户中尚未投资的余额不计入市值；
现金账户只用于识别申购、赎回、分红和费用的发生时点。

## 指标口径

- **收益率（Returns）**：`市值 / 成本 - 1`。它直接比较当前市场价值与剩余持仓成本，
  不按现金流复利。
- **TWR**：把每个价格或持仓变化日作为子区间，按
  `(期末市值 - 当期外部净流入) / 期初市值` 连乘。它排除申购、赎回等外部现金流
  时点的影响，但保留分红和费用。
- **XIRR**：以区间起点的持仓市值作为期初投入，区间内的外部现金流和区间末市值为
  现金流序列，按每笔现金流的实际日期和 365 天一年求使净现值为零的年化利率。
- **MDM（Modified Dietz）**：按每笔外部现金流在区间内停留的天数加权，计算
  现金流调整后的区间收益率。
- **总盈亏**：区间末的 `市值 - 累计净投入` 减去区间开始前一日的同一数值，因此
  包含区间首日的价格变化。已实现盈亏为总盈亏减去未实现盈亏。
- **最大回撤（MDD）**：基于 TWR 财富指数，计算从历史峰值到后续谷值的最大跌幅。
- **年化波动率**：基于相邻 TWR 子区间收益的样本标准差，并按平均区间长度年化。

区间起止日期取自账本中交易和价格指令的范围，工具栏可以切换 `3M`、`YTD`、`1Y`
等到 `MAX`。如果投资在区间开始之后才买入，期初按零持仓处理。

## 多币种与价格

商品市值、成本、现金流和分红都会换算到工具栏选择的目标货币。换算优先使用账本
中的 `price` 指令，也支持从买入成本或卖出价格推导的直接/间接汇率（最多五层）。
因此多币种报表通常需要：

```beancount
2024-01-31 price VOO 420.00 USD
2024-01-31 price USD 7.20 CNY
```

缺少报价时，插件会使用成本或最近可用价格估算，并在页面顶部显示缺失报价和警告。
这些提示不会修改账本。若需要精确的当前市值，请定期写入最新 `price` 指令。

## 页面

- **组合**：当前市值、成本、总盈亏、TWR、XIRR、最大回撤、资产配置和持仓份额。
  资产配置顶部提供默认选中的“全部启用的投资账户”总览，下方同时显示分组汇总和
  全部单项配置，分组行使用独立样式和标签。点击条目会把顶部筛选同步到对应组或
  投资，再次点击当前条目或点击总览可恢复全部投资。
- **表现**：将组合与分组、账户或商品价格归零到共同起点后比较。
- **收益**：月度热力图、年度和区间指标柱状图。
- **投资**：每个账户和分组的收益、盈亏与风险指标；账户表底部显示全部启用投资的
  合并合计，XIRR、TWR、MDD 和波动率按合并后的现金流与净值序列重新计算。
- **分红**：按投资账户拆分的月度/年度分红。
- **现金流**：外部现金流与分红现金流，以及逐笔明细。
- **配置**：投资账户、分组、显示设置和保存后的 JSON 预览。

配置保存使用文件修订号做冲突检测。如果配置文件在页面打开后被其他程序修改，
保存会失败并要求重新读取，避免覆盖外部改动。

## 示例账本

仓库提供一套可独立使用的示例：

- `../../examples/portfolio-returns-demo.bean`：VOO 与 FUND005827 两笔投资，
  包含 USD/CNY 双币种、分批买入、部分卖出、费用、现金分红和红利再投资。
- `../../examples/portfolio-returns-demo.json`：与示例账户、分组和默认区间
  完全匹配的插件配置。
- `../../examples/portfolio-returns-multi-asset.bean`：QQQ、AAPL、BND、GLD、
  BTC、VNQ 六种资产，覆盖 ETF、个股、债券、黄金、加密货币和 REITs。
- `../../examples/portfolio-returns-multi-asset.json`：预置“成长组合”“收入组合”
  和“对冲组合”三个分组，可在筛选、收益和对比页面直接切换。

在 `main.bean` 中取消下面这一行的注释即可加载示例：

```beancount
include "./examples/portfolio-returns-demo.bean"
```

多资产示例使用：

```beancount
include "./examples/portfolio-returns-multi-asset.bean"
```

如果要用示例替换当前配置，可在插件目录执行：

```sh
cp ../../examples/portfolio-returns-demo.json config.json
# 或
cp ../../examples/portfolio-returns-multi-asset.json config.json
```

当前仓库的 `config.json` 已同时配置实际账本中的
`Assets:Investment:Fund:FUND005827`、两套示例资产，以及“实盘持仓”
“核心指数与基金”“成长组合”“收入组合”“对冲组合”五个分组。主账本也已加载
两套示例 Bean，打开“投资组合收益”页面即可直接查看。

## 开发检查

在 `beancount-private/plugins` 目录运行：

```sh
../../ledger/node_modules/.bin/tsc -p tsconfig.backend.json --noEmit
../../ledger/node_modules/.bin/tsc -p tsconfig.frontend.json --noEmit
```

前端只允许导入 `react` 和插件目录内的相对模块，不能依赖 MUI、ECharts 等
Dashboard 包。
