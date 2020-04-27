// this function will take 4 arguments:
// - interval: how long to sleep between loops
// - iterations: the maximum number of loops to do before timeout
// - a function f() that returns a Boolean:
//   - true means that what was being watched for is found and the looping can stop
//   - false means to continue looping
// - a function g() that returns void; on timeout this function is executed.

export async function timeoutWatcher(interval, iterations, f, g ) {
  await (async function theLoop (iterations) {
    setTimeout( 
      async function () {
        if (--iterations) {      // If i > 0, keep going
          let rc = await f();
          if ( rc ) {
            return;
          }
          theLoop(iterations);   // Call the loop again, and pass it the current value of i
        } else {
          g();
        }
      }, interval 
    );

  })(iterations);

}

export default timeoutWatcher;