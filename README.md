# ghq get for GitHub

GitHub の Code ボタンに `ghq get` タブを追加する Chrome Extension

## 機能

- GitHub リポジトリページの「Code」ボタンに「ghq」タブを追加
- `ghq get owner/repo` 形式のコマンドをワンクリックでコピー

## インストール

### 開発版

1. リポジトリをクローン
2. 依存関係をインストール: `pnpm install`
3. ビルド: `pnpm build`
4. Chrome で `chrome://extensions` を開く
5. 「デベロッパーモード」を有効化
6. 「パッケージ化されていない拡張機能を読み込む」をクリック
7. このプロジェクトのルートディレクトリを選択

## 開発

```bash
pnpm install
pnpm dev
```

## ビルド

```bash
pnpm build
```

## ライセンス

MIT