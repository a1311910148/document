const puppeteer = require("puppeteer");
const fs = require("fs");
let arr = [];
let index = 0;
let parallelNum = 0;
let browser = null;
let cate = [
  {
    c: "全部",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=-1&sort=21",
  },
  {
    c: "剧情",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100018&sort=21",
  },
  {
    c: "喜剧",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100004&sort=21",
  },
  {
    c: "动作",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100061&sort=21",
  },
  {
    c: "爱情",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100005&sort=21",
  },
  {
    c: "惊悚",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100010&sort=21",
  },
  {
    c: "犯罪",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=4&sort=21",
  },
  {
    c: "悬疑",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100009&sort=21",
  },
  {
    c: "战争",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100006&sort=21",
  },
  {
    c: "科幻",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100012&sort=21",
  },
  {
    c: "动画",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100015&sort=21",
  },
  {
    c: "恐怖",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100007&sort=21",
  },
  {
    c: "家庭",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100017&sort=21",
  },
  {
    c: "传记",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100022&sort=21",
  },
  {
    c: "冒险",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100003&sort=21",
  },
  {
    c: "奇幻",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100016&sort=21",
  },
  {
    c: "武侠",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100011&sort=21",
  },
  {
    c: "历史",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100021&sort=21",
  },
  {
    c: "运动",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=2&sort=21",
  },
  {
    c: "歌舞",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100014&sort=21",
  },
  {
    c: "音乐",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100013&sort=21",
  },
  {
    c: "纪录",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100020&sort=21",
  },
  {
    c: "伦理",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=100019&sort=21",
  },
  {
    c: "西部",
    u: "https://v.qq.com/channel/movie?listpage=1&_all=1&channel=movie&itype=3&sort=21",
  },
];
// 打开一个浏览器
(async function openBrowser() {
  browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
  });
})();
// 控制
function parallelControl() {}
// 页面获取
async function topage(cate) {
  const page = await browser.newPage();
  await page.goto(cate.u);
  await wait();
  await page.$eval(".movie", (el) => el.scrollTo(0, el.offsetHeight));
  await wait();
  await page.$eval(".movie", (el) => el.scrollTo(0, el.offsetHeight));
  await wait();
  await page.$eval(".movie", (el) => el.scrollTo(0, el.offsetHeight));
  await wait();
  await page.$eval(".movie", (el) => el.scrollTo(0, el.offsetHeight));
  await wait();
  await page.$eval(".movie", (el) => el.scrollTo(0, el.offsetHeight));
  await wait();
  await page.$eval(".movie", (el) => el.scrollTo(0, el.offsetHeight));
  await wait();
  await page.$eval(".movie", (el) => el.scrollTo(0, el.offsetHeight));
  await wait();
  await page.$eval(".movie", (el) => el.scrollTo(0, el.offsetHeight));
  await wait();
  await page.$eval(".movie", (el) => el.scrollTo(0, el.offsetHeight));
  await wait();
  await page.$eval(".movie", (el) => el.scrollTo(0, el.offsetHeight));
  let res = await page.$$eval(".list_item > a", (as) => {
    return as.map((el) => {
      return {
        name: el.title,
        url: el.href,
        img: el.children[0].src,
        duration: el.children[1].innerText,
        score: el.children[2].innerText,
      };
    });
  });
  res.map((el) => {
    el.type = cate.c;
    return el;
  });
  console.log(res);
  arr.push(...res);
  fs.writeFileSync("腾讯电影.json", JSON.stringify(arr));
}
setTimeout(() => {
  let index = 0;
  let timer = setInterval(() => {
    if (index == cate.length) {
      clearInterval(timer);
      return;
    }
    topage(cate[index++]);
  }, 5000);
}, 1000);

function wait() {
  return new Promise((rev, ref) => {
    setTimeout(() => {
      rev(1);
    }, 1000);
  });
}
