const puppeteer = require("puppeteer");
const fs = require("fs");
let arr = [];
let index = 0;
let parallelNum = 0;
let browser = null;

// 打开一个浏览器
(async function openBrowser() {
  browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
  });
})();

// 页面获取
async function topage() {
  const page = await browser.newPage();
  await page.goto(
    "https://list.iqiyi.com/www/1/-------------8-1-1-iqiyi--.html"
  );
  await srcollPage(page, 15);
  let res = await page.$$eval(".qy-mod-li", (as) => {
    return as.map((el) => {
      return {
        name: el.querySelector(".link-txt").title,
        url: el.querySelector(".link-txt").href,
        img:
          "https:" +
          el
            .querySelector("#T-randomAni")
            .style.backgroundImage.split(/\(|\)/)[1]
            .split(/"/)[1],
        jishu: "正片",
      };
    });
  });
  console.log(res);
  arr.push(...res);
  fs.writeFileSync("爱奇艺电影.json", JSON.stringify(arr));
}
setTimeout(() => {
  topage();
}, 1000);

function wait() {
  return new Promise((rev, ref) => {
    setTimeout(() => {
      rev(1);
    }, 1000);
  });
}

function srcollPage(page, count) {
  return new Promise((rev, rej) => {
    let timer = setInterval(async () => {
      if (count == 0) {
        clearInterval(timer);
        rev(1);
      }
      await wait();
      // await page.$eval("html", (el) => (el.documentElement.scrollTop = 20000));
      // document.documentElement.scrollTo(0, document.documentElement.scrollHeight);
      await page.evaluate(async () => {
        document.documentElement.scrollTo(
          0,
          document.documentElement.scrollHeight
        );
      });
      count--;
    }, 500);
  });
}
