import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;
const SP = { width: 360, height: 800 };
const PC = { width: 1280, height: 800 };

// 画面テストの設定（research.md §7・§8、contracts/ci-workflows.md）
export default defineConfig({
  testDir: 'tests',
  // OS 名を含めず、どの環境でも同じ基準画像を参照する。基準画像は CI のコンテナで作る
  snapshotPathTemplate: '{testDir}/visual/__screenshots__/{projectName}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: CI,
  retries: 0,
  reporter: CI ? [['html', { open: 'never' }], ['github']] : [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', scale: 'css', maxDiffPixelRatio: 0 },
  },
  use: {
    baseURL: 'http://localhost:4321',
    locale: 'ja-JP',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321/',
    reuseExistingServer: !CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium-sp', use: { ...devices['Desktop Chrome'], viewport: SP } },
    { name: 'chromium-pc', use: { ...devices['Desktop Chrome'], viewport: PC } },
    { name: 'webkit-sp', use: { ...devices['Desktop Safari'], viewport: SP } },
    { name: 'webkit-pc', use: { ...devices['Desktop Safari'], viewport: PC } },
  ],
});
