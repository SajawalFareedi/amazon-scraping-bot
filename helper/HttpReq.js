const axios = require("axios");
const axiosRetry = require("axios-retry");
const Proxy_Chain = require("proxy-chain");
const https = require("https");

const AxiosGet = async (Asin, Url, Xhr = false) => {
  return new Promise(async (resolve, reject) => {
    try {
      let Res;
      const Domain = Url.split("/")[2];
      let RejectCA = new https.Agent({ rejectUnauthorized: false });
      const ProxyAPI = "<YOUR_PROXY>";
      const proxy = await Proxy_Chain.anonymizeProxy(ProxyAPI);
      let host = proxy.split(":")[1].replace("//", "");
      let port = Number(proxy.split(":")[2]);
      let Instance;
      if (Xhr) {
        Instance = axios.create({
          baseURL: `http://${Domain}/`,
          timeout: 60000,
          httpsAgent: RejectCA,
          proxy: {
            host: host,
            port: port,
            protocol: "http:",
          },
          headers: {
            Host: `${Domain}`,
            "Keep-Alive": true,
            Accept: "text/html,*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,nl;q=0.8,he;q=0.7",
            Cookie:
              "session-id-apay=131-1701833-1482951; i18n-prefs=USD; ubid-main=135-8875385-8180207; session-id-time=2082787201l; lc-main=en_US; session-id-jp=355-4251185-0618918; ubid-acbjp=357-2790762-6341956; session-id=147-4122484-9323857; session-token=Ita+WQvQG8Yg4Hbd9iDdbkI5NQBBgRjNRTb6UEjLIJ8ZEIseKhI8tPUUP+T3WSu6O5quukewtN+wYNxb6Bl4bnl6GKB9qYlk/ZJu5lqBaM1Cs65JeSGxfjqpHukzKaWmt+oBsh8zTFH5BPAjC/ohDqR/SMHW0cmYOQav+PCncaxx4dPtWWYcwuDQQ5IBMyvO; csm-hit=tb:s-Z03AC9ZJGM7W13RSZVN0|1636968055038&t:1636968055038&adb:adblk_yes",
            dnt: "1",
            Referer: `http://www.amazon.com/dp/${Asin}/ref=olp-opf-redir?aod=1&ie=UTF8&startIndex=0&condition=new`,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36",
            "x-requested-with": "XMLHttpRequest",
          },
        });
      } else {
        Instance = axios.create({
          baseURL: `http://${Domain}/`,
          timeout: 60000,
          httpsAgent: RejectCA,
          proxy: {
            host: host,
            port: port,
            protocol: "http:",
          },
          headers: {
            Host: `${Domain}`,
            "Keep-Alive": true,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,nl;q=0.8,he;q=0.7",
            Cookie:
              "session-id-apay=131-1701833-1482951; i18n-prefs=USD; ubid-main=135-8875385-8180207; session-id-time=2082787201l; lc-main=en_US; session-id-jp=355-4251185-0618918; ubid-acbjp=357-2790762-6341956; session-id=147-4122484-9323857; session-token=Ita+WQvQG8Yg4Hbd9iDdbkI5NQBBgRjNRTb6UEjLIJ8ZEIseKhI8tPUUP+T3WSu6O5quukewtN+wYNxb6Bl4bnl6GKB9qYlk/ZJu5lqBaM1Cs65JeSGxfjqpHukzKaWmt+oBsh8zTFH5BPAjC/ohDqR/SMHW0cmYOQav+PCncaxx4dPtWWYcwuDQQ5IBMyvO; csm-hit=tb:s-07E9YZR23X187TABNDYG|1636970482663&t:1636970486511&adb:adblk_yes",
            Referer: `http://www.amazon.com/s?k=${Asin}&ref=nb_sb_noss`,
            "Upgrade-Insecure-Requests": 1,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36",
          },
        });
      }
      axiosRetry(Instance, {
        retries: 5,
        retryDelay: axiosRetry.exponentialDelay,
      });
      await Instance.get(Url.replace("https", "http"))
        .then((Response) => {
          Res = Response;
        })
        .catch((err) => {
          console.trace(err);
          reject(err);
        });
      resolve(Res);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
};

const AxiosPost = async (Asin) => {};

const PuppeteerGet = async (Url, Data) => {};

module.exports = { AxiosGet, AxiosPost, PuppeteerGet };

//// const HTTPS_Proxy_Agent = require("https-proxy-agent");
//// const Puppeteer = require("puppeteer-extra");
//// const PluginStealth = require("puppeteer-extra-plugin-stealth");
//// const UserDir = require("puppeteer-extra-plugin-user-data-dir");
//// const NodeFetch = require("node-fetch");
//// Puppeteer.use(PluginStealth());
//// Puppeteer.use(UserDir());

// // let asin = Asin;
//// const Url =
////   "https://www.amazon.com/hz/reviews-render/ajax/medley-filtered-reviews/get/ref=cm_cr_dp_d_fltrs_srt";
//// const Data = {
////   language: "en_US",
////   activeTab: "filterByLanguage",
//// reviewerType: "",
//// formatType: "current_format",
//// mediaType: "",
//// filterByStar: "",
//// pageNumber: "1",
//// filterByLanguage: "",
//// filterByKeyword: "",
//// shouldAppend: "undefined",
//// deviceType: "desktop",
//// canShowIntHeader: "undefined",
//// reftag: "cm_cr_arp_d_viewopt_fmt",
//// pageSize: "10",
////   asin: asin,
////   sortBy: "recent",
////   scope: "reviewsAjax0",
//// };
//// const headers = {
////   Host: "www.amazon.com",
////   "User-Agent":
////     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36",
////   Accept: "text/html,*/*",
////   "Accept-Encoding": "gzip, deflate, br",
////   "Accept-Language": "en-US,en;q=0.9",
////   Referer: `https://www.amazon.com/gp/product/${asin}?th=1`,
////   "X-Requested-With": "XMLHttpRequest",
////   "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
////   Pragma: "no-cache",
////   "Cache-Control": "no-cache",
//// };
//// const httpsAgent = new https.Agent({
////   keepAlive: true,
//// });
//// const ProxyAPI =
////   "http://scraperapi:ac7c179a7992c1c7c61f6131be4bb803@proxy-server.scraperapi.com:8001";
//// const Proxy = Proxy_Chain.anonymizeProxy(ProxyAPI);
//// const Opts = {
////   method: "post",
////   body: Data,
////   agent: new HTTPS_Proxy_Agent(String(Proxy)),
////   headers: headers,
//// };
//// const response = await NodeFetch(Url, Opts);
//// const data = await response;
//// console.log(data);
//// await axios
////   .post(Url, Data, { headers: headers })
////   .then(function (response) {
////     Res = response;
////   })
////   .catch(function (error) {
////     console.log("Error in Axios Post Request: " + error);
////   });
//// return data;
