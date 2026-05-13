# 心晴助手 Next.js 部署指南

## 🚀 部署到 Vercel（超簡單）

### 方法一：直接上傳到 Vercel（推薦小白）

#### 步驟 1：下載項目代碼

把這個 `xinqing-next` 文件夾下載到你的電腦。

#### 步驟 2：上傳到 GitHub

1. 打開 https://github.com/new
2. Repository name 填 `xinqing-next`
3. 點 "Create repository"
4. 在你的電腦上打開 Terminal（終端機），進入 `xinqing-next` 文件夾：

```bash
cd xinqing-next
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/你的用戶名/xinqing-next.git
git push -u origin main
```

#### 步驟 3：在 Vercel 上部署

1. 打開 https://vercel.com/new
2. 登入你的 Vercel 帳號
3. 點 "Import Git Repository"
4. 選擇你剛創建的 `xinqing-next` repo
5. 點 "Deploy"，等約 2-3 分鐘就完成！

#### 步驟 4：設置環境變量（最重要！）

1. 部署完成後，進入 Vercel Dashboard
2. 點你的專案 → Settings → Environment Variables
3. 添加以下三個變數：

| 名稱 | 值 | 說明 |
|------|-----|------|
| `WECHAT_APPID` | 你的公眾號 AppID（如 wx7c...） | 微信發布用 |
| `WECHAT_APPSECRET` | 你的公眾號 AppSecret（如 e8ec...） | 微信發布用 |
| `GLM_API_KEY` | 你的 GLM API Key（如 xxxxxxxx.yyyyyyyy） | AI 生成文章和圖片用 |

> 💡 **如何獲取 GLM API Key？**
> 1. 打開 https://open.bigmodel.cn/
> 2. 註冊/登入帳號
> 3. 進入「API Keys」頁面
> 4. 點「添加新的 API Key"
> 5. 複製 Key（格式類似 `xxxxxxxx.yyyyyyyy`）

4. 點 "Save"
5. 回到專案頁面，點 "Redeploy" 重新部署

#### 步驟 5：設置微信 IP 白名單

1. 打開 https://mp.weixin.qq.com
2. 登入你的公眾號後台
3. 左側菜單：開發 → 基本配置
4. 找到 "IP 白名單"，點 "查看"
5. 把 Vercel 的 IP 地址加進去

> 💡 **如何找到 Vercel 的 IP？**
> 1. 在 Vercel Dashboard 點你的專案
> 2. 點 "Settings" → "Domains"
> 3. 看到你的域名（如 `xinqing-next.vercel.app`）
> 4. 在電腦 Terminal 輸入：`ping xinqing-next.vercel.app`
> 5. 把顯示的 IP 地址加到微信白名單

> ⚠️ **如果 IP 白名單設置麻煩**，可以臨時關閉 IP 白名單驗證（測試完記得打開）：
> 在微信後台 → 開發 → 基本配置 → 取消 "啟用 IP 白名單"

---

### 方法二：用 Vercel CLI（進階）

如果你電腦已經裝了 Vercel CLI：

```bash
# 登入 Vercel
vercel login

# 進入項目目錄
cd xinqing-next

# 部署
vercel --prod

# 設置環境變量
vercel env add WECHAT_APPID
vercel env add WECHAT_APPSECRET

# 重新部署
vercel --prod
```

---

## ✅ 部署完成後

你的網站會有一個 Vercel 域名，例如：
```
https://xinqing-next-你的用戶名.vercel.app
```

打開這個網址，就可以使用「心晴助手」了！

---

## 🔧 常用操作

### 更新代碼後重新部署

```bash
git add .
git commit -m "update"
git push origin main
```

Vercel 會自動檢測到 GitHub 的更新並自動重新部署！

### 查看 API 是否正常

打開瀏覽器訪問：
```
https://你的域名/api/wechat/token
```

如果顯示 `{"success":true,"token":"..."}` 就說明 API 正常！

如果顯示 `{"success":false,"error":"WECHAT_APPID or WECHAT_APPSECRET not configured"}`，說明環境變量還沒設置好。

---

## 🆘 常見問題

**Q: 部署失敗怎麼辦？**
A: 檢查 Vercel 的 Build Logs（部署記錄），看紅色錯誤信息是什麼。

**Q: 發布到微信失敗？**
A: 檢查以下幾點：
1. 環境變量 WECHAT_APPID 和 WECHAT_APPSECRET 是否正確
2. 微信公眾號的 IP 白名單是否設置了 Vercel 的 IP
3. 公眾號是否已認證（未認證的訂閱號無法使用發布 API）

**Q: 如何自定義域名？**
A: 在 Vercel Dashboard → Settings → Domains → 添加你的自定義域名

---

## 📁 項目結構

```
xinqing-next/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/              # 群組路由（含側邊欄佈局）
│   │   │   ├── dashboard/      # Dashboard 頁面
│   │   │   ├── topics/         # 主題庫頁面
│   │   │   ├── editor/         # 文章編輯器頁面
│   │   │   └── history/        # 貼文管理頁面
│   │   ├── api/wechat/         # 微信 API 路由
│   │   │   ├── token/          # 獲取 access_token
│   │   │   ├── upload-image/   # 上傳圖片
│   │   │   ├── create-draft/   # 創建草稿
│   │   │   └── publish/        # 發布貼文
│   │   ├── layout.tsx          # 根佈局
│   │   └── page.tsx            # 首頁（重定向到 dashboard）
│   ├── components/             # React 組件
│   │   ├── Navbar.tsx          # 側邊導航
│   │   ├── Layout.tsx          # 頁面佈局
│   │   ├── WechatPublishButton.tsx  # 微信發布按鈕
│   │   └── ui/                 # UI 組件（shadcn）
│   ├── data/                   # 數據文件
│   │   ├── topics.ts           # 12個心理健康主題
│   │   ├── mockPosts.ts        # 模擬貼文數據
│   │   └── mockSchedules.ts    # 模擬排程數據
│   └── lib/                    # 工具函數
│       ├── wechat.ts           # 微信 API 封裝
│       └── useWechatPublish.ts # 發布 Hook
├── public/                     # 靜態資源（圖片）
├── next.config.ts              # Next.js 配置
├── package.json                # 依賴列表
└── DEPLOY.md                   # 本文件
```
