const route = document.getElementById('route')
const time = document.getElementById('time');
const timeBack = document.getElementById('time-back');
const result = document.getElementById('result');
const btn = document.getElementById('count');
const timeDiff = -180 - new Date().getTimezoneOffset()
const reset = document.getElementById('reset')

let timeZoneGMT;
{
    let diff = 3 * 60 + timeDiff;
    let a = diff - Math.trunc(diff / 60) * 60;
    if (a == 0) a = '00'
    if (diff > 0) timeZoneGMT = `+${Math.trunc(diff / 60)}:${a}`;
    else timeZoneGMT = `-${Math.trunc(diff / 60)}:${a}`;


}
document.getElementById('warning').innerHTML = `Ваш часовой пояс GMT${timeZoneGMT}. Время указано в вашем локальном часовом поясе.`


//time shifting
function timeShifting (el) {
    let newTime = el.value.slice(0,5).split(':');
    newTime = +newTime[0] * 60 + +newTime[1];
    newTime += timeDiff;
    let a = newTime - Math.trunc(newTime / 60) * 60;
    if (a == 0) a = '00'
    newTime = `${Math.trunc(newTime / 60)}:${a}`;
    el.value = el.innerHTML = newTime + el.value.slice(5);
}

for (let el of time) {
    if (el.value === 'Выберите время') continue;
    timeShifting(el);
}

for (let el of timeBack) {
    if (el.value === 'Выберите время') continue;
    timeShifting(el);
}


function routeChecking() {
    switch (route.value) {
        case 'из А в В':
            for (let el of time) {
                if (el.value.includes('из В в А')) el.setAttribute('disabled', 'disabled');
            }
            break;
        case 'из В в А':
            for (let el of time) {
                if (el.value.includes('из А в В')) el.setAttribute('disabled', 'disabled');
            }
            break;
        case 'из А в В и обратно в А':
            for (let el of time) {
                if (el.value.includes('из В в А')) el.setAttribute('disabled', 'disabled');
            }
            document.getElementsByClassName('time-back')[0].classList.remove('time-back_hidden');
            break;
    }
}

function checkHiddenTime() {
    return document.getElementsByClassName('time-back')[0].classList.contains('time-back_hidden')
}

function correctTimePossibility() {
    let value = this.value.slice(0,5).split(':');
    value = +value[0] * 60 + +value[1] + 50;
    Array.from(timeBack.options)
        .map((el) => {
        el = el.value.slice(0,5).split(':');
        el = +el[0] * 60 + +el[1];
        return el;
    })
        .forEach((el, i) => {
        value >= el ? timeBack.options[i].setAttribute('disabled', 'disabled') : timeBack.options[i].removeAttribute('disabled');
    })
    if (time.value === 'Выберите время') {
        for (let el of timeBack.options) {
            el.setAttribute('disabled','disabled');
        }
    }
}

routeChecking();

route.addEventListener('change', function () {
    time.value = 'Выберите время';
    timeBack.value = 'Выберите время';
    for (let el of time.options) {
        el.removeAttribute('disabled');
    }
    for (let el of timeBack.options) {
        el.setAttribute('disabled','disabled');
    }
    document.getElementsByClassName('time-back')[0].classList.add('time-back_hidden');
    routeChecking();

    if (!checkHiddenTime()) time.addEventListener('change', correctTimePossibility);
});


function buttonClick() {

    function validationTickets() {
        if (document.getElementById('num').value === '') {
            result.innerHTML = 'Для подсчета стоимости билета введите количество билетов.'
            result.classList.remove('result_hidden')
            return false;
        }
        if (document.getElementById('num').value >= 1000) {
            result.innerHTML = 'Введите меньшее число билетов.'
            result.classList.remove('result_hidden')
            return false;
        }
        return true;
    }
    function validation() {
        function showError () {
            result.innerHTML = 'Для подсчета стоимости билета выберите время.'
            result.classList.remove('result_hidden')
        }
        if (route.value === 'из А в В и обратно в А') {
            if (time.value === 'Выберите время' || timeBack.value === 'Выберите время') {
                showError();
                return false;
            }
        } else {
            if (time.value === 'Выберите время') {
                showError();
                return false;
            }
        }
        return true;
    }

    function showValidResult() {
        function conjugation (n) {
            let words = ['билет', 'билета', 'билетов']
            n = Math.abs(n) % 100;
            let n1 = n % 10;
            if (n > 10 && n < 20) { return words[2]; }
            if (n1 > 1 && n1 < 5) { return words[1]; }
            if (n1 == 1) { return words[0]; }
            return words[2];
        }
        function timeString(timeLength) {
            if (timeLength == 50) return '50 минут';
            else return '1 час 40 минут'
        }
        function getTimeReturn() {
            let timeFirst = time.value.slice(0,5).split(':');
            let timeSecond;
            if (timeLength == 50) {
                timeSecond = +timeFirst[0] * 60 + +timeFirst[1] + 50;
                let a = timeSecond - Math.trunc(timeSecond / 60) * 60;
                if (a == 0) a = '00';
                timeSecond = `${Math.trunc(timeSecond / 60)}-${a}`
                return `${timeFirst.join('-')}, а прибудет в ${timeSecond}`
            } else {
                timeSecond = timeBack.value.slice(0,5).split(':');
                timeSecond = +timeSecond[0] * 60 + +timeSecond[1] + 50;
                let a = timeSecond - Math.trunc(timeSecond / 60) * 60;
                if (a == 0) a = '00';
                timeSecond = `${Math.trunc(timeSecond / 60)}-${a}`
                return `${timeFirst.join('-')}, а прибудет обратно в\n${timeSecond}`
            }
        }
        result.innerHTML = `Вы выбрали ${tickets} ${conjugation(tickets)} стоимостью ${price}р.\nСуммарное время в пути составит ${timeString(timeLength)}.\nТеплоход отправляется в ${getTimeReturn()}`
        result.classList.remove('result_hidden')
    }

    let timeLength;
    if (!validationTickets()) return;
    let tickets = document.getElementById('num').value;
    let price = route.value === 'из А в В и обратно в А' ? 1200 : 700;
    price *= tickets;
    if (route.value !== 'из А в В и обратно в А') {
        if (!validation()) return;
        timeLength = 50;
        showValidResult();
    } else {
        if (!validation()) return;
        timeLength = 120;
        showValidResult();
    }
}

btn.addEventListener('click',buttonClick)

reset.addEventListener('click', function () {
    route.value = 'из А в В';
    time.value = 'Выберите время';
    timeBack.value = 'Выберите время';
    result.classList.add('result_hidden');
    timeBack.parentNode.classList.add('time-back_hidden');
    document.getElementById('num').value = '';
})






