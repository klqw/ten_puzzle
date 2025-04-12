'use strict';
const qnum = document.getElementById('qnum');
const resulttxt = document.getElementById('resulttxt');
const num1 = document.getElementById('num1');
const num2 = document.getElementById('num2');
const num3 = document.getElementById('num3');
const num4 = document.getElementById('num4');
const decide = document.getElementById('decide');
const skip = document.getElementById('skip');
const cheat = document.getElementById('cheat');
const record = document.getElementById('record');
const cheatlist = document.getElementById('cheatlist');
const correctcnt = document.getElementById('correctcnt');
const incorrectcnt = document.getElementById('incorrectcnt');
const skipcnt = document.getElementById('skipcnt');
const cheatcnt = document.getElementById('cheatcnt');
const ctndisp = document.getElementById('ctndisp');
const recordmodal = document.getElementById('recordmodal');
const recorddisp = document.getElementById('recorddisp');
const close = document.getElementById('close');

const counts = {
    quantity: 0,
    correct: 0,
    incorrect: 0,
    skip: 0,
    cheat: 0
};
let continuous = 0;
let out = 0;
let useCheat = false;
let records = {};
let setSessions = [];   // セッション保存時に使用

setQuestionAndCorrects();

// ボタン押下処理
decide.addEventListener('click', function() {
    let judge = false;
    const ope1 = document.querySelector('input[name="ope1"]:checked');
    const ope2 = document.querySelector('input[name="ope2"]:checked');
    const ope3 = document.querySelector('input[name="ope3"]:checked');
    const answer = num1.innerText + ope1.value + num2.innerText + ope2.value + num3.innerText + ope3.value + num4.innerText;
    // console.log(answer);
    records.answer = answer;
    const corrects = correctCheck();
    // console.log(corrects);
    for (let i = 0; i < corrects.length; i++) {
        if (answer === corrects[i]) {
            judge = true;
            break;
        }
    }
    if (judge) {
        correctAndReload();
    } else {
        incorrect();
    }
});

skip.addEventListener('click', function() {
    doSkip();
    setQuestionAndCorrects();
});

cheat.addEventListener('click', function() {
    cheatDisp();
});

record.addEventListener('click', function() {
    setSession();
    recordmodal.style.display = 'block';
    recorddisp.innerHTML = setRecordDisp(getSession());
});

close.addEventListener('click', function() {
    recordmodal.style.display = 'none';
});
// ボタン押下処理ここまで

// 問題設定
function setQuestionAndCorrects() {
    let num;
    let result = '';
    let numbers = [];
    const operators = ['+', '-', '*', '/'];
    const corrects = [];
    sessionStorage.removeItem('corrects');

    while (true) {
        for (let i = 0; i < 4; i++) {
            num = Math.floor(Math.random() * 9) + 1;
            numbers.push(num);
        }
        
        for (let i = 0; i < operators.length; i++) {
            for (let j = 0; j < operators.length; j++) {
                for (let k = 0; k < operators.length; k++) {
                    result = numbers[0] + operators[i] + numbers[1] + operators[j] + numbers[2] + operators[k] + numbers[3];
                    if (eval(result) === 10) {
                        corrects.push(result);
                    }
                }
            }
        }

        if (corrects.length > 0) {
            break;
        }
        numbers = [];
    }

    // 解答確認用
    // console.log(corrects);

    counts.quantity++;
    out = 0;
    useCheat = false;

    // recordsの初期化
    records = {quantity: counts.quantity, answer: '', solution: '', type: '', out: 0};

    qnum.innerHTML = counts.quantity;
    resulttxt.innerHTML = '　';

    num1.innerHTML = numbers[0];
    num2.innerHTML = numbers[1];
    num3.innerHTML = numbers[2];
    num4.innerHTML = numbers[3];
    document.querySelectorAll('input[name="ope1"]').forEach(radio => {
        if (radio.value === "+") {
            radio.checked = true;
        }
    });
    document.querySelectorAll('input[name="ope2"]').forEach(radio => {
        if (radio.value === "+") {
            radio.checked = true;
        }
    });
    document.querySelectorAll('input[name="ope3"]').forEach(radio => {
        if (radio.value === "+") {
            radio.checked = true;
        }
    });

    cheatlist.innerHTML = '　';
    correctcnt.innerHTML = '正解:' + counts.correct;
    incorrectcnt.innerHTML = 'お手つき:' + counts.incorrect;
    skipcnt.innerHTML = 'スキップ:' + counts.skip;
    cheatcnt.innerHTML = 'カンニング:' + counts.cheat;
    if (continuous >= 2) {
        ctndisp.innerHTML = '現在 ' + continuous + '問連続正解中です！'
    } else {
        ctndisp.innerHTML = '　';
    }

    for (let i = 0; i < corrects.length; i++) {
        records.solution += corrects[i];
        if ((i + 1) != corrects.length) {
            records.solution += ',';
        }
    }

    sessionStorage.setItem('corrects', corrects);
}

function correctCheck() {
    let corrects = [];
    corrects = sessionStorage.getItem('corrects').split(',');
    return corrects;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 正解処理
async function correctAndReload() {
    document.body.style.pointerEvents = "none";
    if (!useCheat) {
        continuous++;
        counts.correct++;
        records.type = 'correct';
        resulttxt.className = 'correctstr';
        resulttxt.innerHTML = '正解です！';
    } else {
        continuous = 0;
        records.type = 'cheat';
        resulttxt.className = 'cheatstr';
        resulttxt.innerHTML = '正解です(カンニングあり)';
    }
    if (out > 0) {
        records.out++;
    }
    setSessions.push({ ...records });
    await sleep(1000);
    setQuestionAndCorrects();
    document.body.style.pointerEvents = "auto";

}

// 不正解処理
async function incorrect() {
    continuous = 0;
    out++;
    counts.incorrect++;
    records.out = out;
    records.type = 'incorrect';
    setSessions.push({ ...records });
    incorrectcnt.innerHTML = 'お手つき:' + counts.incorrect;
    if (out < 3) {
        resulttxt.className = 'incorrectstr';
        resulttxt.innerHTML = '不正解です' + ' (残り ' + (3 - out) + '回)';
        ctndisp.innerHTML = '　';
    } else {
        resulttxt.innerHTML = out + '回お手つきをしたので次の問題に進みます';
        document.body.style.pointerEvents = "none";
        await sleep(1800);
        setQuestionAndCorrects();
        document.body.style.pointerEvents = "auto";
    }

}

// スキップ処理
function doSkip() {
    continuous = 0;
    counts.skip++;
    if (out > 0) {
        records.out++;
    }
    records.type = 'skip';
    records.answer = '';
    setSessions.push({ ...records });
}

// カンニング処理
function cheatDisp() {
    if (!useCheat) {
        counts.cheat++;
    }
    useCheat = true;
    let cheatArray = correctCheck();
    let tmpText = '';
    let cheatText = '';
    for (let i = 0; i < cheatArray.length; i++) {
        tmpText = cheatArray[i];
        cheatText += operatorStringReplace(tmpText);
        if ((i + 1) != cheatArray.length) {
            cheatText += ', ';
        }
    }
    cheatlist.innerHTML = cheatText;
    cheatcnt.innerHTML = 'カンニング:' + counts.cheat;
}

// セッション処理
function setSession() {
    sessionStorage.setItem('records', JSON.stringify(setSessions));
}

function getSession() {
    const records = JSON.parse(sessionStorage.getItem('records'));
    // console.log(records);
    return records;
}

// 記録表示処理
function setRecordDisp(records) {
    let bgc, qty, ans, sol, typ, out;
    let recordText = '<table><tr class="thd"><td>問題数</td><td>あなたの回答</td><td>結果</td><td>解答例</td></tr>';
    for (let i = 0; i < records.length; i++) {
        bgc = (i % 2 === 0) ? 'odd' : 'even';
        qty = records[i].quantity;
        typ = records[i].type;
        out = records[i].out;
        ans = operatorStringReplace(records[i].answer);
        sol = (out > 0 && out < 3 && typ === 'incorrect') ? ' ' : operatorStringReplace(records[i].solution);
        sol = sol.replace(/\,/g, '<br>');

        recordText += '<tr class="' + bgc + ' ' + typ + 'str"><td>第' + qty + '問' + ((out > 0) ? ('(' + out + '回目)') : '') +'</td><td>' + ans + '</td><td>' + typeStringReplace(typ) + '</td><td>' + sol + '</td></tr>';
    }
    recordText += '</table>';
    return recordText;
}

// 文字列置換
function operatorStringReplace(replaceString) {
    replaceString = replaceString.replace(/\+/g, '＋');
    replaceString = replaceString.replace(/\-/g, '－');
    replaceString = replaceString.replace(/\*/g, '×');
    replaceString = replaceString.replace(/\//g, '÷');
    return replaceString;
}

function typeStringReplace(replaceString) {
    replaceString = replaceString.replace(/incorrect/g, 'お手つき');
    replaceString = replaceString.replace(/correct/g, '正解');
    replaceString = replaceString.replace(/skip/g, 'スキップ');
    replaceString = replaceString.replace(/cheat/g, 'カンニング');
    return replaceString;
}