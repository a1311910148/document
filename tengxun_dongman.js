const async = require("async");
const puppeteer = require("puppeteer");
const fs = require("fs");
let parallelNum = 0;
let browser;
// 爬取的json
let arr = JSON.parse(fs.readFileSync("./腾讯动漫.json", "utf-8"));
// 创建一个 浏览器
(async function openBrowser() {
  browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
  });
})();
async function topage(el, callback) {
  parallelNum++;
  console.log(parallelNum);
  const page = await browser.newPage();
  await page.goto(el.url);
  try {
    //等待2秒
    await wait();
    let varr = [];
    let tabsNum = await page.$$eval(".b-tab__item", (tabs) => {
      return tabs.length;
    });
    console.log(tabsNum);
    if (tabsNum == 0) {
      let res1 = await getpage();
      console.log(res1);
      varr.push(...res1);
    } else {
      // 第一页
      let res1 = await getpage();
      console.log(res1);
      varr.push(...res1);
      // 第二页
      await page.click(".b-tab__item:nth-child(2)");
      await wait();
      let res2 = await getpage();
      console.log(res2);
      varr.push(...res2);
      //  第三页
      try {
        await page.click(".b-tab__item:nth-child(3)");
        await wait();
        let res3 = await getpage();
        console.log(res3);
        varr.push(...res3);
      } catch (error) {
        console.log("咩有第三页");
      }
      // 更多页
      await page.click(".b-tab__more");
      await wait();
      // 第四页
      try {
        await page.click(".b-tab__dropdown .b-tab__item:nth-child(1)");
        await wait();
        let res4 = await getpage();
        console.log(res4);
        varr.push(...res4);
      } catch (error) {
        console.log("咩有第四页");
      }

      // 第五页
      try {
        await page.click(".b-tab__item:nth-child(2)");
        await wait();
        let res5 = await getpage();
        console.log(res5);
        varr.push(...res5);
      } catch (error) {
        console.log("咩有第五页");
      }

      // 第六页
      try {
        await page.click(".b-tab__item:nth-child(3)");
        await wait();
        let res6 = await getpage();
        console.log(res6);
        varr.push(...res6);
      } catch (error) {
        console.log("咩有第六页");
      }
    }
    async function getpage() {
      return new Promise(async (rev, rej) => {
        let res = await page.$$eval(".episode-list-rect__item", (as) => {
          return [...as].map((el) => {
            return {
              jishu: el.textContent,
              url: `https://v.qq.com/x/cover/${el.children[0].dataset.cid}/${el.children[0].dataset.vid}.html`,
              tag: el.children[0].children[0].src,
            };
          });
        });
        rev(res);
      });
    }

    console.log(varr);
    el.videosUrl = varr;
    page.close();
    parallelNum--;
    callback();
  } catch (error) {
    parallelNum--;
    page.close();
    callback();
  }
}
setTimeout(() => {
  async.mapLimit(
    arr,
    1,
    (el, callback) => {
      topage(el, callback);
    },
    () => {
      fs.writeFileSync("./腾讯动漫async.json", JSON.stringify(arr));
    }
  );
}, 3000);
function wait() {
  return new Promise((rev, ref) => {
    setTimeout(() => {
      rev(1);
    }, 2000);
  });
}
