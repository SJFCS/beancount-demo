# Prices 插件

在本地账本侧栏的 Prices 页面识别账本中声明、交易、账户和价格指令使用的商品。
可以逐项修改来源、来源代码、报价货币、输出路径和启用状态，也可以添加货币对。
查询价格只预览；“抓取并写入”追加到对应的价格文件；“保存配置”让每日任务使用这些设置。
每行末尾的“抓取”只查询当前这一项并展示在查询结果中，使用该行尚未保存的最新字段；
随后可在结果旁点击“写入账本”提交，适合单独重试失败商品。

前端、后端和 manifest 均位于本插件目录：`frontend.tsx`、`backend.ts`、
`manifest.json`。价格来源、文件写入与每日执行判断全部由 `backend.ts`
实现，ledger 服务仅提供通用插件加载器、认证、仓库接口和每分钟调用。

## 默认识别

| 类型            | 来源              | 示例                        | 默认输出                 |
| --------------- | ----------------- | --------------------------- | ------------------------ |
| 法定货币        | Frankfurter / ECB | USD → CNY（CNY 为主货币）   | `prices/USD.bean`        |
| 法定货币        | Frankfurter / ECB | USD → GBP（GBP 不是主货币） | `prices/USD-to-GBP.bean` |
| 国内基金        | 天天基金净值      | FUND005827 或 F005827 → CNY | `prices/FUND005827.bean` |
| 常见加密货币    | Coinbase          | BTC → CNY                   | `prices/BTC.bean`        |
| 股票 / 其他商品 | Yahoo Finance     | AAPL → CNY                  | `prices/AAPL.bean`       |

默认报价货币来自账本的第一个 operating_currency，可用 YAML 的 `quote` 覆盖。
报价货币等于主货币时文件名只保留商品代码；只有报价不是主货币时才使用
`商品-to-报价.bean`。
页面上修改商品或报价货币时，仍处于自动生成状态的输出路径会随之更新；
手工改过的自定义输出路径会保留。
基金报价固定为 CNY；同币种转换不生成价格。例如主货币 USD 时，CNY 走汇率源，
FUND005827 以代码 005827 查询 CNY 净值，USD → USD 被跳过。

像 `BND` 这样同时是 ISO 法币代码的证券，只要账户使用 `FIFO` 等 booking，或交易
带有成本，就会按证券而不是法币处理；也可以用 commodity 的 `price` 元数据显式
指定来源。价格目录只读取账本原始指令；估值、预测等插件生成的合成商品会列在页面
中，默认关闭并标记为“合成”，不会自动请求行情。自定义合成商品也可在 commodity
下添加 `synthetic: TRUE`，效果相同。

Yahoo 触发限流时会自动尝试 Nasdaq（仅限美股代码）；也可在页面直接选择
`nasdaq`。Yahoo 返回 `GBp`、`ZAc`、`ILA` 等最小单位时会被换算成标准货币
（如 `GBp` → `GBP`），不会把“便士”当成“英镑”。

## beanprice 元数据

参考 [beanprice](https://github.com/beancount/beanprice) 的格式，在 commodity 下声明：

```beancount
2019-07-01 commodity FUND005827
  price: "CNY:eastmoneyfund/005827"

2019-07-01 commodity AAPL
  price: "USD:yahoo/AAPL"
```

支持 `yahoo`、`nasdaq`、`eastmoneyfund`、`exchangerate`、`ecbrates`、
`coinbase`、`coincap`、`alphavantage`、`beancount`、`tsp`。
`coinmarketcap`、`oanda`、`quandl` 已注册来源名称，但需要对应 API key，当前
只保留能力声明和配置入口，不会静默失败。
这是 TypeScript 中的来源适配，无需安装 Python beanprice，也不会执行任意 Python 来源。
Yahoo 的港股代码需要如 `0700.HK`，代码映射在页面修改。
选 Yahoo 查询法币时，默认 CNY 等代码会转换为 `CNYUSD=X` 形式。

元数据支持 beanprice 的多来源、多报价和反向报价语法：

```beancount
2019-07-01 commodity AAPL
  price: "USD:yahoo/AAPL,nasdaq/AAPL"

2019-07-01 commodity BTC
  price: "USD:coinbase/BTC-USD,coincap/BTC CNY:coinbase/BTC-CNY"

2019-07-01 commodity CAD
  price: "USD:yahoo/^USDCAD=X"
```

逗号分隔的多个来源会按顺序回退；`^` 表示先取倒数，再按报价货币换算，
例如 `USD:yahoo/^USDCAD=X` 会得到 USD/CAD。Yahoo、Nasdaq、
Alpha Vantage、CoinCap 在报价货币不同但都是法币时，会用 Frankfurter
自动换算，并在结果中返回 `conversion` 明细。天天基金、Coinbase 和其它
来源仍严格校验币种，避免把一种货币的数字直接标成另一种货币。

需要 API key 的来源从进程环境变量读取，不会写入账本或返回给前端：

- `alphavantage`：`ALPHAVANTAGE_API_KEY`
- `coincap`：`COINCAP_API_KEY`（CoinCap v3 已不再提供无需凭据的 v2 接口）
- `beancount`：`BEANCOUNT_PRICES_COOKIE`（beancount.io 价格 feed 需要登录 Cookie）
- `coinmarketcap`：`COINMARKETCAP_API_KEY`
- `oanda`：`OANDA_API_KEY`
- `quandl`：`QUANDL_API_KEY`

Beancount.io 来源参考 [live-prices](https://beancount.io/live-prices)，输入 feed 别名，
如 `BTC-USD`，请求 `https://beancount.io/prices/BTC-USD`。feed 必须只含合法价格、
受支持元数据和注释，且商品和报价货币必须与配置一致。
远端服务要求登录；把浏览器里的 `authSess:beancount.io=...` 整段 Cookie 赋给
`BEANCOUNT_PRICES_COOKIE` 即可，本地登录凭据不会自动发给该服务。

## 文件与历史

输出必须位于 `prices/` 内，可指定 `prices/funds/FUND005827.bean` 等子目录。
插件不再维护索引文件，每条价格直接写入配置的输出文件。`main.bean` 用
`include "prices/*"` 引入顶层价格文件；使用子目录时需再显式引入对应目录，
例如 `include "prices/funds/*"`。
每条价格保留提供商的交易/净值日期，Coinbase 即时价格使用抓取日（UTC）。
提供商币种与配置不一致时，可自动换算的来源会保留原始币种、汇率和换算日期；
不能换算的来源会报告错误，不能把 CNY 数字直接当作 USD 写入。

已有同日期、商品、报价货币的记录会跳过，保留历史、人工价格、注释和元数据。
来源在周末或休市日通常仍返回上一个交易日/净值日，例如周六返回周五的价格；
如果该日期已经写入，任务会显示“没有新增价格”并跳过，而不会把旧行情改记成
运行当天。页面和最近任务会显示来源最新日期及跳过数量，便于区分正常去重和抓取失败。
每行的“价格”按钮会直接读取账本中的全部 `price` 指令，按日期倒序列出该商品的
完整历史；这张表不依赖额外的运行状态文件。
点击“查询价格”后，可在结果区直接点击“写入账本”，提交本次已经获取的报价，
不会再次请求外部来源；查询失败的项目不会写入。
单个来源失败不影响其他来源；失败价格不写入文件。所有文件通过现有仓库写入接口
和版本检查提交，遵循本地账本已有的 Git 设置。

## 每日任务

启用插件：

```yaml
plugins:
  prices:
    enabled: true
    daily: true
    time: "18:00"
    timezone: Asia/Shanghai

navigation:
  routes:
    prices:
      group: plugins
      position: first
      quick_menu: true
```

每日时间与时区也可在页面编辑并保存，页面配置优先于 YAML。
配置保存在 `plugins/prices/config.json`。定时任务只在 `plugins/prices/state.json`
保留一个 `scheduledDay` 字段，用来避免服务重启后在同一天重复抓取；抓取结果、错误和
价格历史都不再复制到状态文件，手动任务也不会写它。本地 ledger 服务每分钟检查一次；
过了设定时间会执行一次，停机期间错过的当天任务在启动后补跑。历史停机日期不补抓。
服务必须保持运行；失败后可在页面手动重试，下一天的定时任务会再次尝试。

单笔查询和批量任务最多同时请求 3 个来源；查询请求不占用账本写锁，最终价格和定时
标记通过一次仓库写入提交。

## 本地 API

- `GET /api-gateway/local/plugins/prices/api?ledgerId=...`：识别和读取配置，不访问外部来源。
- `GET /api-gateway/local/plugins/prices/api/capabilities?ledgerId=...`：读取来源列表、报价类型、API key 配置状态和历史/序列能力。
- `POST /api-gateway/local/plugins/prices/api`：保存 `ledgerId`、`revision`、`instruments`、`schedule`。
- `POST /api-gateway/local/plugins/prices/api/refresh`：抓取当前配置，可传 `instruments`、`date`（`YYYY-MM-DD`），`write: false` 仅查询。
- `POST /api-gateway/local/plugins/prices/api/commit`：把页面逐项查询得到的 `prices`、`errors` 一次性写入，供抓取进度使用。
- `POST /api-gateway/local/plugins/prices/api/quote`：单笔查询，body 为 `{ ledgerId, instrument, date? }`，不写文件。
- `POST /api-gateway/local/plugins/prices/api/series`：日期区间查询，body 为 `{ ledgerId, instrument, from, to }`，不写文件。
- `POST /api-gateway/local/plugins/prices/api/history`：读取已写入账本的全部价格，body 为 `{ ledgerId, commodity, quote }`。

`quote` 和 `series` 的 `instrument` 只需要 `commodity`、`quote`，可选
`source`、`ticker`、`fallbacks` 和 `file`；未提供的字段按商品类型自动补全。例如：

```json
{
  "ledgerId": "personal",
  "instrument": {
    "commodity": "AAPL",
    "quote": "USD",
    "source": "nasdaq",
    "ticker": "AAPL"
  },
  "date": "2026-11-06"
}
```

以上接口均要求本地会话认证，且插件必须启用。

页面支持夜间模式，跟随应用的主题设置自动切换配色。
