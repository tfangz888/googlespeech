const puppeteer = require('puppeteer');
const program = require('commander');
const fs = require('fs');
// 处理参数，接受一个-e的参数
program
    .option('-e, --english [value]', 'node googleTrans.js -e 待翻译的英文, 用单引号两边引起来')
    .parse(process.argv);
    
let english = program.english;
console.log(process.argv);
console.log(english);

(async () => {
    const browser = await puppeteer.launch({
        executablePath: '.\\node_modules\\puppeteer\\.local-chromium\\win64-543305\\chrome-win32\\chrome.exe',
        headless: true
        // Launch puppeteer browser using a proxy server on port 3600.
        // args: [ '--proxy-server=127.0.0.1:3600' ]
    });
    const page = await browser.newPage();
    //await page.goto("https://translate.google.cn/#auto/zh-CN", {
      await page.goto("https://translate.google.cn/", {       
        // 由于要绕过高墙，可能比较耗时，这里超时设为0，也就是没有超时时间
        timeout: 0
    });
    // 等待页面加载出id="source"的元素
    await page.waitFor("#source");
    // 获取id="source"的元素
    let englishObj = await page.$("#source");
    //  光标聚焦到id="source"的元素
    englishObj.focus();
    // 聚焦之后输入我们要翻译的英文，输入的时候每次按键之间间隔1ms
    await page.keyboard.type(english, {delay: 10});
    await page.keyboard.type('\n', {delay: 10});
    // 等待“翻译”按钮展示出来
    await page.waitFor("#gt-submit");
    // 获取“翻译”按钮对象
    let gtBtn = await page.$("#gt-submit");
    // 模拟鼠标点击“翻译”按钮对象
    await gtBtn.click();
    // 等待500ms
    await page.waitFor(500);
    // 等待翻译完毕，翻译前后下面这个元素会改变他的属性，我们等待他翻译完毕
    await page.waitFor("#gt-swap[aria-disabled=false]");
    // 等待翻译结果页面渲染完毕
    await page.waitFor("#result_box span");

    // 等待“speaker”按钮展示出来
    await page.waitFor("#gt-src-listen");
    // 获取“speaker”按钮对象
    let englishSpeaker = await page.$("#gt-src-listen"); 
    await page.setRequestInterception(true);
    var url2 = '';
    page.on('request', request => {
        var url = request.url();
        if ( url.includes('translate_tts') )
        {
            page.setRequestInterception(false);
            console.log("request url: " + url);
            url2 = url;
        } 
        // console.log("resourceType: " + request.resourceType());
    });
    /*
    page.on('response', response => {
        console.log("test2: " + response.url());
        let dataReceived = response.buffer();        
        console.log("test3: " + dataReceived);
        // response.buffer()
    });  */
    /*
    var response_bkup;
    await page.on('response', response => {
    const url_res = response.url();
    if (!url_res.startsWith('data:') && response.ok) {
      response.buffer().then(
        b => {
          console.log(`${response.status()} ${url_res} ${b.length} bytes`);
          if ('200' == response.status())
          {
              // console.log(`test4: ${response.status()} ${url_res} ${b.length} bytes`);
              response_bkup = response;

              const buffer = response.buffer();
              let filename = 'd:\\tmp.mp3';
              fs.writeFileSync(filename, buffer);
              console.log("write to tmp1.mp3");
          }
        },
        e => {
          console.error(`${response.status()} ${url_res} failed: ${e}`);
        }
      );
    }
    });
    */

    // My write_mp3
    const write_mp3 = async function(response) {
      const buffer = await response.buffer();
       let filename = 'd:\\tmp.mp3';
       fs.writeFileSync(filename, buffer);
       console.log("write to d:tmp.mp3");
    }
    // response_fun function
    const response_fun = async function() {
    var response_bkup;
    await page.on('response', response => {
    const url_res = response.url();
    if (!url_res.startsWith('data:') && response.ok && !url_res.startsWith('play') && url_res.startsWith('translate')) {
      response.buffer().then(
        b => {
          console.log(`${response.status()} ${url_res} ${b.length} bytes`);
          if ('200' == response.status())
          {
              // console.log(`test4: ${response.status()} ${url_res} ${b.length} bytes`);
              write_mp3(response);
          }
        },
        e => {
          console.error(`${response.status()} ${url_res} failed: ${e}`);
        }
       );
      }
      });
    }

    // Call response_fun
    response_fun();

    // 模拟鼠标点击“speaker”按钮对象
    await englishSpeaker.click();  
    do 
    {        
        await page.waitFor(500);  // 等待500ms
        console.log(url2);
    } while ('' == url2);
    // await page.goto(url2);
    await page.waitFor(1000);    
    
    //await page.waitFor('video[name=media]');
    //await page.focus('video[name=media]');

    // 将函数传递给页面执行，获取页面中翻译的结果
    let chinese = await page.evaluate(()=>{
        elements = document.querySelectorAll("#result_box span");
        var chinese = "";
        for (var i=0; i<elements.length; i++) {
            chinese += elements[i].innerHTML;
        }
        return chinese;
    });
    // 打印结果
    // console.log(chinese);
    console.log('finished');
    // 关闭浏览器
    browser.close();
})();
