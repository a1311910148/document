const puppeteer = require("puppeteer");
const fs = require("fs");
let arr = JSON.parse(fs.readFileSync("./腾讯电视剧.json", "utf-8"));
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
    let res = await page.$eval(".episode-list-rect__list", (as) => {
      return [...as.children].map((el) => {
        return {
          jishu: el.textContent,
          url: `https://v.qq.com/x/cover/${el.children[0].dataset.cid}/${el.children[0].dataset.vid}.html`,
          tag: el.children[0].children[0].src,
        };
      });
    });
    console.log(res);
    this.videosUrl = res;
    page.close();
    parallelNum--;
    fs.writeFileSync("./腾讯视频_完整1.json", JSON.stringify(arr));
  } catch (error) {
    parallelNum--;
    page.close();
  }
}
// 开启
setTimeout(() => {
  setInterval(() => {
    if (index == arr.length || parallelNum == 10) {
      fs.writeFileSync("./腾讯视频_完整1.json", JSON.stringify(arr));
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
