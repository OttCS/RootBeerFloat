// // Actual descriptive function: But for performance it's way easier to just index directly into lookup
function minifloatToNumber(mf) {
    let s = mf >> 7; // Signed (true is negative because I hate myself)
    let e = (mf & 0x78) >> 3; // Exponent
    let m = mf & 0x7; // Mantissa
    let i = 2 ** (e - 2); // Row increment
    let b = 2 ** (e + 1) - 2; // Base value of the row
    return (s ? -1 : 1) * (b + m * i); // Smoosh it together
}
minifloatToNumber.lookup = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 30, 34, 38, 42, 46, 50, 54, 58, 62, 70, 78, 86, 94, 102, 110, 118, 126, 142, 158, 174, 190, 206, 222, 238, 254, 286, 318, 350, 382, 414, 446, 478, 510, 574, 638, 702, 766, 830, 894, 958, 1022, 1150, 1278, 1406, 1534, 1662, 1790, 1918, 2046, 2302, 2558, 2814, 3070, 3326, 3582, 3838, 4094, 4606, 5118, 5630, 6142, 6654, 7166, 7678, 8190, 9214, 10238, 11262, 12286, 13310, 14334, 15358, 16382, 18430, 20478, 22526, 24574, 26622, 28670, 30718, 32766, 36862, 40958, 45054, 49150, 53246, 57342, 61438, 65534, 73726, 81918, 90110, 98302, 106494, 114686, 122878, 0, -0.25, -0.5, -0.75, -1, -1.25, -1.5, -1.75, -2, -2.5, -3, -3.5, -4, -4.5, -5, -5.5, -6, -7, -8, -9, -10, -11, -12, -13, -14, -16, -18, -20, -22, -24, -26, -28, -30, -34, -38, -42, -46, -50, -54, -58, -62, -70, -78, -86, -94, -102, -110, -118, -126, -142, -158, -174, -190, -206, -222, -238, -254, -286, -318, -350, -382, -414, -446, -478, -510, -574, -638, -702, -766, -830, -894, -958, -1022, -1150, -1278, -1406, -1534, -1662, -1790, -1918, -2046, -2302, -2558, -2814, -3070, -3326, -3582, -3838, -4094, -4606, -5118, -5630, -6142, -6654, -7166, -7678, -8190, -9214, -10238, -11262, -12286, -13310, -14334, -15358, -16382, -18430, -20478, -22526, -24574, -26622, -28670, -30718, -32766, -36862, -40958, -45054, -49150, -53246, -57342, -61438, -65534, -73726, -81918, -90110, -98302, -106494, -114686, -122878];
// Lookup is perfect because there's only 256 minifloats

const numberToMinifloat = (n) => {
    let s = (n < 0) << 7;
    let e = Math.log2(Math.abs(n) + 2) - 1;
    let b0 = Math.abs(2 ** ((e ^ 0) + 1) - 2); // Base of row
    let b1 = Math.abs(2 ** ((e ^ 0) + 2) - 2); // Base of next row
    let m = Math.round(8 * (Math.abs(n) - b0) / (b1 - b0)); // 8-part scale between b0 and b1
    e ^= 0; // ^ 0 just truncates decimal remainder
    e <<= 3;
    return s + e + m;
}

const lookaheadGetMinifloat = (x, y, z) => {
    let b = y - x;
    let c = z - x;
    let best = {
        d: 0,
        total: 999999,
        mf: 0
    }
    let diff = [0, -1, 1];
    for (let d = 0; d < diff.length; d++) {
        let ab = numberToMinifloat(b) + diff[d];
        let bc = numberToMinifloat(c - minifloatToNumber.lookup[ab]);

        let deltaB = Math.abs(b - minifloatToNumber.lookup[ab]);
        let deltaC = Math.abs(c - minifloatToNumber.lookup[ab] - minifloatToNumber.lookup[bc]);

        if (best.total > deltaB + deltaC) {
            best.d = diff[d];
            best.total = deltaB + deltaC;
            best.mf = ab;
        }
        if (best.total < 2) return best.mf;
    }
    return best.mf;
}

// for (let i = -62; i <= 62; i++) {
//     console.log(i + " to " + minifloatToNumber(numberToMinifloat(i)))
// }

// console.log(minifloatToNumber.lookup[numberToMinifloat(61)])

// function checkSample() {
//     let a = 0;
//     let b = -((Math.random() * 48 + 14) ^ 0);
//     let c = -((Math.random() * 124) ^ 0);

//     let best = {
//         d: 0,
//         total: 99
//     }
//     let diff = [0, -1, 1];
//     console.log("Actual:", a, b, c)
//     for (let d = 0; d < 3; d++) {
//         let ab = numberToMinifloat(b) + diff[d];
//         let bc = numberToMinifloat(c - minifloatToNumber.lookup[ab]);
//         // let bc = numberToMinifloat(c - (minifloatToNumber.lookup[ab]));
//         console.log("RtBrFl:", a, minifloatToNumber.lookup[ab], minifloatToNumber.lookup[ab] + minifloatToNumber.lookup[bc], "Delta", diff[d]);

//         // let bc = numberToMinifloat(c - minifloatToNumber.lookup[ab]);

//         let deltaB = Math.abs(b - minifloatToNumber.lookup[ab]);
//         let deltaC = Math.abs(c - minifloatToNumber.lookup[ab] - minifloatToNumber.lookup[bc]);

//         // console.log('=========',diff[d])

//         // console.log(a, minifloatToNumber.lookup[ab], minifloatToNumber.lookup[bc])
//         // console.log(a, deltaB, deltaC)

//         if (best.total > deltaB + deltaC) {
//             best.d = diff[d];
//             best.total = deltaB + deltaC;
//         }
//     }
//     if (best.d != 0) {
//         console.log("Best", best.d);
//         console.log(a, b, c)
//     } else {
//         requestAnimationFrame(checkSample);
//     }
// }
// checkSample();

// (function bruteForceTester() {
//     let inc = 0.25;
//     let prev = 0;
//     for (let e = 0; e < 16; e++) {
//         for (let m = 0; m < 8; m++) {
//             // console.log(prev);
//             if (-prev != minifloatToNumber(numberToMinifloat(-prev)))
//                 console.log('Error on -' + prev, numberToMinifloat(-prev), minifloatToNumber(numberToMinifloat(-prev)))
//             prev = prev + inc
//         }
//         inc *= 2;
//     }
// })();

// [0, .25, .5, .75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13, 14, 15, 15.5, 16, 17, 18, 19, 20, 21, 22, 23, 23.5, 24, 24.5, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37].forEach(x => {
//     console.log(x, '>', minifloatToNumber(numberToMinifloat(x)))
// })

async function mapper(fn, arr, startIndex = 0) {
    return new Promise((resolve, reject) => {
        let index = startIndex;
        let batchSize = 48_000;
        let lastFrameTime = 0;

        function iterate() {
            const frameStart = performance.now();
            const elapsedTime = frameStart - lastFrameTime;
            lastFrameTime = frameStart;

            let iterations = 0;
            let frameTime = 0;

            while (iterations < batchSize && index < arr.length) {
                try {
                    fn(arr[index], index, arr);
                    index++;
                    iterations++;
                } catch (error) {
                    reject(error);
                    return;
                }
            }
            frameTime = performance.now() - frameStart;

            batchSize *= 0.8 / (frameTime / elapsedTime); // Aim for whatever % frametime

            prog.update(index / arr.length);

            if (index < arr.length) {
                requestAnimationFrame(iterate);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(() => { // Kick off iterations with solid timing
            lastFrameTime = performance.now();
            requestAnimationFrame(iterate);
        })
    });
}
