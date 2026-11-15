# 插件配置

“插件配置”插件把当前账本的插件注册表和
`benacount-local.yaml` 放在一个根级设置页。插件入口固定在根导航末尾。

## 启用

```yaml
plugins:
  local_config:
    enabled: true

navigation:
  routes:
    local_config:
      group: root
      position: last
```

页面地址：

```text
/ledger/<owner>/<ledger>/plugins/local_config
```

即使关闭“插件配置”自身，上述地址仍可打开，以便重新启用。
该恢复能力由 manifest 的 `"alwaysAccessible": true` 声明；它不会让禁用的插件继续运行
后台 hooks，也不会把禁用插件加入侧边栏或快捷菜单。配置文件缺少、无法解析或导航结构
无效时，该恢复入口仍可打开完整 YAML 编辑器，用于修复原文件。

## 图形化配置

- 插件列表展示已安装插件和现有 YAML 中配置过但尚未安装的插件。
- 启用状态和快捷菜单成员关系使用按钮操作。`navigation.routes.<plugin-id>` 控制侧边栏
  分组与顺序，`quick_menu` 仅控制“+”快捷菜单；关闭快捷菜单只会把
  `quick_menu` 写成 `false`，侧边栏入口和顺序保持不变。
- 未注册侧边栏 route 的插件仍保留在配置列表并可直接打开；选择导航分组或顺序并保存后，
  会新增对应 route。
- 所有已写入 `plugins` 段的插件都可以使用同一套拖动排序；注册表顺序写回
  `plugins` 段，已注册插件在同一导航分组内的顺序同步写回数值 `position`。
- 插件配置自身也可以在页面中启停、拖动和编辑；其侧边栏入口固定为
  根导航的最终位置。
- 点击插件后，可以配置 `plugins.<plugin-id>` 段内的设置。布尔值、数字和字符串
  使用对应控件，嵌套对象显示为分组。
- 导航注册支持分组、首位/末位和指定序号，`quick_menu` 保持为独立开关。

## 完整 YAML

“完整 YAML”页保留原始文件编辑器。图形化操作只更新对应的 YAML 路径，未涉及的
注释、空行和人工排版保持不变。两个视图共用 SHA revision 校验，避免覆盖在
编辑器或其他客户端发生的修改；只读账本仍可查看全部配置。编辑器支持即时搜索、
匹配计数以及上一个/下一个结果定位，并拦截 `Ctrl+F` / `Cmd+F` 用于搜索当前
YAML。
