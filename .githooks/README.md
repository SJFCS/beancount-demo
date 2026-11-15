
# Git hooks

Enable the repository's pre-commit formatter once per clone:

```bash
git config core.hooksPath .githooks
```

The hook formats staged `*.bean` files with `beanfmt` using `.beanfmt.toml`
before each commit.
