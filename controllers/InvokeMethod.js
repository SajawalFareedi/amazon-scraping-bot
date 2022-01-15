const { default: PQueue } = require("p-queue");
const AmazonUsa = require("../runner");
const queue = new PQueue({ concurrency: 1 });
let count = 0;

async function InvokeMethod(request, response, Resp, id, Output) {
  queue.on("active", () => {
    console.log(
      `PQueue Working on item #${++count}.  Size: ${queue.size}  Pending: ${
        queue.pending
      }`
    );
  });

  queue.on("error", (error) => {
    console.error("Whooops! This broke with error: ", error);
  });

  queue.on("add", () => {
    console.log(
      `PQueue Task is added.  Size: ${queue.size}  Pending: ${queue.pending}`
    );
  });

  queue.on("next", () => {
    console.log(
      `PQueue Task is completed.  Size: ${queue.size}  Pending: ${queue.pending}`
    );
  });

  let method = request.body.method;

  switch (method) {
    case "StartScrapper":
      await queue.add(() => {
        return new Promise(async (resolve, reject) => {
          await new AmazonUsa(request.body, Resp, id, Output)
            .then(() => {
              resolve(true);
            })
            .catch((e) => {
              reject(e);
            });
        });
      });
      break;
    case "JobEnd":
      count = 0;
      queue.add(() => Promise.resolve(JobEnd(request.body)));
      break;
  }

  return response.end(
    JSON.stringify({
      success: true,
    })
  );
}

async function JobEnd(payload) {}

module.exports = InvokeMethod;
