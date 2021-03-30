let answerJSON;
let isFirstReq = true
let statesInfo = {}
var oldKeyValueJson = {}
var uuid = uuidv4()

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function declOfNum(number, titles) {
    cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

let accessRequest = true;

function getKeys(entityName, entityType, keys, jsonKeys) {

    if (typeof entityName == 'undefined' || keys == '' || typeof keys == 'undefined')
        return

    if (accessRequest) {
        accessRequest = false;

        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://' + window.location.hostname + ':1880/getObjectIdAndKeys?entityName=' + entityName + '&entityType=' + entityType + '&keys=' + keys, true);
        xhr.send();
        xhr.onload = filials;

        function filials() {
            let answer = JSON.parse(xhr.responseText);
            drawTable(answer, jsonKeys)

            accessRequest = true;
        }
    } else {

    }

}

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
        days = (duration / (1000 * 60 * 60 * 24)).toFixed(1) < 1 ? '' : (duration / (1000 * 60 * 60 * 24)).toFixed(0)

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    hours = hours == '00' ? 0 : hours

    if (days === '' && hours != 0) {
        return `${hours.toString().substr(0, 1) == '0' ? hours.toString().slice(1) : hours}<span style="font-size:12px">ч:</span>${minutes}<span style="font-size:12px">м</span>`
    } else if (hours == '0') {
        return `${minutes.toString().substr(0, 1) == 0 ? minutes.toString().slice(1) : minutes}<span style="font-size:12px">м</span>`
    } else {
        return `${days}<span style="font-size:12px">д:</span>${hours.toString().substr(0, 1) == '0' ? hours.toString().slice(1) : hours}<span style="font-size:12px">ч:</span>${minutes.toString().substr(0, 1) == 0 ? minutes.toString().slice(1) : minutes}<span style="font-size:12px">м</span>`
    }
}

function formatter(number) {
    return Math.abs(Number(number)) >= 1.0e+9
        ? (Math.abs(Number(number)) / 1.0e+9).toFixed(3) + `<span style="font-size:12px">млд.шт</span>`
        : Math.abs(Number(number)) >= 1.0e+6
            ? (Math.abs(Number(number)) / 1.0e+6).toFixed(3) + `<span style="font-size:12px">млн.шт</span>`
            : Math.abs(Number(number)) >= 1.0e+3
                ? (Math.abs(Number(number)) / 1.0e+3).toFixed(3) + `<span style="font-size:12px">тыс.шт</span>`
                : Math.abs(Number(number)) + `<span style="font-size:12px">шт</span>`
}

function drawTable(keyValueJson, jsonKeys) {

    let tableHTML;
    let isImg = false;
    let isAnyChanges = false

    var tableForInfo = ``
    var tableForParameters = ``
    let tableForOEE = ``

    let labels = {
        inWork: {backgroundColor: 'green', label: 'В работе'},
        inIdle: {backgroundColor: '#43434c', label: 'Простой'},
        good: {backgroundColor: 'green', label: 'Норма'},
        bad: {label: 'Брак'}
    }

    for (let i = 0; i < jsonKeys.length; i++) {
        let key = jsonKeys[i].key;
        ;
        let value = keyValueJson[key];
        if (oldKeyValueJson[key] === value)
            continue;
        oldKeyValueJson[key] = value;
        isAnyChanges = true
    }

}

var ctx = false
var myChart = false
var first = true

self.onInit = function () {

    self.ctx.datasourceTitleCells = [];
    self.ctx.valueCells = [];
    self.ctx.labelCells = [];
    self.onResize();
    $('#nouuid').attr('id', uuid)

    ctx = $(`#${uuid} > .box > #myChart_small`)[0].getContext('2d');

    myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: '',
                    data: [/*12, 19, 3, 5, 2, 3*/],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false,
                    bodyFontSize: 22,
                }
            },
        },
    );

    $(document).click((event) => {
        if (event.target.className == 'horizontalNavigation' && event.target.nodeName == 'A' ||
            event.target.nodeName == 'H4')
            myChart.destroy()
    })

    console.log('ctx.data:', self.ctx.data)

}

function arrayToElement(array = "[1604656800291,{'trend':0,'value':0}]") {
    let template = {}
    let oneElement = JSON.parse(array[1]) // объект

    for (let key in oneElement) {
        template[key] = {
            percent: oneElement[key],
            ts: 0
        }
    }
    let mockArray = [[1604656877870, '{"value":0,"OT":0,"NOT":0,"trend":0}']]

    let dataArray = self.ctx.data[0].data.length > 1 ? self.ctx.data[0].data : mockArray // если ничего не прилетело - mock
    let myObj = JSON.parse(dataArray[dataArray.length - 1][1]) // экземпляр объекта

    for (let key in myObj) {
        myObj[key] = 0 // Обнуляем для корректной суммы в дальнейшем
    }


    const i = dataArray.length - 1

    if (i < 0)
        return

    let element = JSON.parse(dataArray[i][1])

    for (let key in element) {
        if (!isNaN(parseFloat(element[key]))) {
            if (isNaN(myObj[key]))
                myObj[key] = 0
            myObj[key] += parseFloat(element[key])
        }
    }

    function isAN(value) {
        if (value instanceof Number)
            value = value.valueOf();
        return isFinite(value) && value === parseFloat(value, 10);
    }

    myObj.value = isAN(myObj.value) ? parseFloat((myObj.value).toFixed(1)) : 'н/д'
    myObj.trend = (myObj.trend).toFixed(1)


    $(`#${uuid} > .box > #info_center`).html(`${myObj.value.toFixed(1)}%`)

    let tableForOEE = ``

    for (let key in myObj) {
        if (key == 'value' || key == 'trend')
            continue

        tableForOEE += `
            <tr> <td style="font-size: 14px;">${
            key == 'TP' ? 'Факт' :
                key == 'DP' ? 'Брак' :
                    key == 'OT' ? 'Работа' :
                        key == 'NOT' ? 'Простой' :
                            key == 'TPP' ? 'План' :
                                key == 'GP' ? 'Норма' :
                                    key}:</td> </tr>
            <tr> <td style="font-size: 22px; font-weight: bold;">
                ${(key === 'OT' || key === 'NOT') ? msToTime(myObj[key] * 60000) : formatter(myObj[key])}</td></tr>
           `
    }

    let iconTrend = `<i class="fa fa-arrow-up"></i>`
    if (parseFloat(myObj.trend) < 0) {
        iconTrend = `<i class="fa fa-arrow-down"></i>`
        $(`#${uuid} > #info_in_bottom`).css('color', 'red')
    } else
        $(`#${uuid} > #info_in_bottom`).css('color', '#43C6C9')
    $(`#${uuid} > #info_in_bottom`).html(`${iconTrend} ${myObj.trend ? myObj.trend : (typeof myObj.trend == 'undefined') ? 'н/д' : 0.0}%`)


    if (!isNaN(myObj)) {
        if (myObj % 1 !== 0)
            myObj = myObj.toFixed(2)
    }

    $(`#${uuid} > .box > #oee_small`).html(tableForOEE)


    // если значения по нулям - то добавляем background бублику
    let sum = 0;
    for (let key in myObj) {
        sum = sum + parseInt(myObj[key]);
    }

    if (sum == 0) {
        $(`#${uuid} > .box > canvas`).css({
            'background': `radial-gradient(circle at center,
             rgba(0,0,0,0) 0, 36%, 
             rgb(67 67 76)37%, 
             rgb(67 67 76) 70%,
             rgba(0,0,0,0.2) 71%,
             rgba(0,0,0,0) 65%,
             rgba(0,0,0,0) 100%)`
        })
    }

    for (let key in template) {
        template[key].percent = 0 // Обнуляем
    }

    // проценты для бублика
    template.value.percent = myObj.value
    template.inIdle = {percent: 100 - myObj.value}

    let result = template

    return result

}

function toListOfElements(states) {

    const level = 'allStates'  //ToDo кастомизация уровня объекта (простои или работы, etc...) на уровне настройки виджета
    let resultList = {}
    let listStates = {}
    let labels = {
        inIdle: {label: 'Простой'},
        good: {label: 'Норма', backgroundColor: 'green'},
        bad: {label: 'Брак'},
        value: {label: 'В работе'}
    }
    switch (level) {
        case 'allStates': {
            for (let key in states) {
                let element = {}
                if (typeof labels[key] == 'undefined')
                    element.label = key
                else {
                    element.label = labels[key].label
                    if (typeof labels[key].backgroundColor !== 'undefined')
                        element.backgroundColor = labels[key].backgroundColor
                }
                element.percent = states[key].percent
                resultList[key] = element
            }
        }
    }
    return resultList
}

function toChartDataset(states) {

    let template = {
        labels: [/*'234','2341*/],
        datasets: [{
            label: '',
            data: [/*12, 19, 3, 5, 2, 3*/],
            //  green     green     black     green     black
            backgroundColor: ['#43C6C9', '#43C6C9', '#43434c', '#43C6C9', '#43434c'],
            borderColor: [],
            borderWidth: 1
        }]
    }


    for (let key in states) {
        template.labels.push(states[key].label)
        template.datasets[0].data.push(states[key].percent.toFixed(2))
    }

    if (template.labels.length == 2) {
        template.datasets[0].backgroundColor[1] = '#43434c'
    }

    return template
}

function checkAndUpdate(data) {

    const oldDatasets = myChart.config.data.datasets[0].data
    const newDatasets = data.datasets[0].data
    let changed = false
    for (let i = 0; i < newDatasets.length; i++) {
        if (typeof oldDatasets[i] == 'undefined' || oldDatasets[i] != newDatasets[i])
            changed = true
    }

    if (changed) {
        myChart.config.data = data
        if (first) {
            myChart.options.animation.animateRotate = true
            first = false
        } else
            myChart.options.animation.animateRotate = false
        myChart.update();
    }
}

self.onDataUpdated = function () {

    $(`.tb-widget-loading`).hide() // скрыть лоадер

    for (let i = 0; i < self.ctx.data.length; i++) {

        let data = self.ctx.data[i]
        let key = data.dataKey.name

        if (typeof data.data[0] == 'undefined')
            continue
        let value = data.data[0][1]

        let entityName = data.datasource.entityName
        if (typeof statesInfo[entityName] == 'undefined')
            statesInfo[entityName] = {}
        statesInfo[entityName][key] = value

        if (key === 'codeState') {
            for (let state in statesInfo) {
                if (statesInfo[state].codeState == value) {
                    value = state
                }
            }
        }
    }


    let dataArray;

    for (var i = 0; i < self.ctx.data.length; i++) {
        dataArray = self.ctx.data[i].data[0]
    }

    let states = {}

    try {
        states = arrayToElement(dataArray) // Получаем один элемент
    } catch (e) {

    }

    let legendElements = []
    try {
        legendElements = toListOfElements(states) //Получаем проценты,цвета, лейблы только нужных нам стейтов
    } catch (e) {

    }

    legendElements = toChartDataset(legendElements)

    checkAndUpdate(legendElements)

    // chart end

    let jsonKeys = []
    let entityType;
    let entityName;

    for (let i = 0; i < self.ctx.data.length; i++) {

        let data = self.ctx.data[i]

        entityName = data.datasource.entityName
        entityType = data.datasource.entityType

        if (typeof data.data[0] == 'undefined')
            continue
        try {
            jsonKeys = JSON.parse(data.data[0][1])
        } catch (e) {
            return
        }
    }

    let keys = []
    for (let i = 0; i < jsonKeys.length; i++) {
        keys.push(jsonKeys[i].key)
    }

    //getKeys(entityName,entityType,keys, jsonKeys)

}

self.onResize = function () {
}

self.onDestroy = function () {
    myChart.destroy()
}
