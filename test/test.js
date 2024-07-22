import puppeteer from 'puppeteer';
const log = console.log;
//Localizar via linha de comando (CLI) ou variável de ambiente (ENV)
const searchTernCLI = process.argv.length >= 3 ? process.argv[2] : 'Volbeat';
const searchTernENV = process.argv.length ?? 'Volbeat';


(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1600,
    height: 1000,
    deviceScaleFactor: 1,
  });

  await page.goto('https://www.youtube.com/');
  // await page.waitForSelector('#search.gsfi');
  await page.waitForSelector('#search-input  #search');
  //Efeito borrado
  await page.emulateVisionDeficiency('blurredVision')
  await page.type('#search-input  #search', searchTernCLI, { delay: 100 });
  await page.screenshot({ path: './screenshot/youtube-homeblurred.jpg' })
  await page.emulateVisionDeficiency('none')
  await page.screenshot({ path: './screenshot/youtube-home.jpg' })
  await Promise.all([
    page.waitForNavigation(),
    page.click('#search-icon-legacy')
  ]);
  // wait till next page
  await page.waitForSelector('ytd-video-renderer h3 a#video-title');
  await page.screenshot({ path: './screenshot/searchresults.jpg' })

  const firstMatch = await page.$eval('ytd-video-renderer h3 a#video-title', (elem) => {
    //Executa quando o elemento a#video-title é encontrado
    return elem.innerHTML
  })
  console.log({ firstMatch });
  await Promise.all([
    page.waitForNavigation(), 
    page.click('ytd-video-renderer h3 a#video-title'),
    new Promise((resolve) => setTimeout(resolve, 17000)),
      
  ]);
  await page.screenshot({ path: './screenshot/first-video.jpg' })
  await page.waitForSelector('ytd-comments-header-renderer h2')
  const videoComments = await page.$eval('ytd-comments-header-renderer h2', (h2) =>{
    return h2.innerText;
  });
  console.log({videoComments});

  const firstSuggested = await page.$eval('ytd-compact-video-renderer',(elem)=>{
    return elem.querySelector('h3').innerText;
  });
  console.log({firstSuggested});

  await browser.close();
})();