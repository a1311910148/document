const puppeteer = require("puppeteer");
const fs = require("fs");
let arr = JSON.parse(fs.readFileSync("./爱奇艺电视剧.json", "utf-8"));
console.log(arr);
let index = 0;
let parallelNum = 0;
let browser = null;
let cate = [];

// 打开一个浏览器
(async function openBrowser() {
  browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
  });
})();

// 页面获取
async function topage() {
  parallelNum++;
  const page = await browser.newPage();
  await page.goto(this.url);
  await wait();

  try {
    let link = await page.$eval(".header-link", (a) => {
      return a.href;
    });
    console.log(link);
    await page.goto(link);
    let vs = await page.$$eval(".album_item a", (as) => {
      return as.map((el) => {
        return {
          jishu: el.innerText,
          url: el.href,
        };
      });
    });
    this.videosUrl = vs;
    console.log(vs);
    page.close();
    parallelNum--;
    fs.writeFileSync("./爱奇艺电视剧_完整.json", JSON.stringify(arr));
  } catch (error) {
    page.close();
    parallelNum--;
  }
}

// 开启
setTimeout(() => {
  setInterval(() => {
    if (index == arr.length || parallelNum == 5) {
      return;
    }
    topage.bind(arr[index++])();
  }, 1000);
}, 1000);

function wait() {
  return new Promise((rev, ref) => {
    setTimeout(() => {
      rev(1);
    }, 2000);
  });
}
