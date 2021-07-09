ctx = false
myChart = false
first = true

let colors = false
self.onInit = function () {
    getColors()

    self.ctx.$scope.trackFn = function () {
        return self.ctx.$scope.legendList
    }
}

function getColors() {
    let entityType;
    let entityName;
    let entityID;
    const keys = 'productList'
    if (typeof self.ctx == 'undefined')
        return

    for (let i = 0; i < self.ctx.data.length; i++) {
        let data = self.ctx.data[i]
        entityName = data.datasource.entityName
        entityType = data.datasource.entityType
        entityID = data.datasource.entityId
    }
    if (typeof entityName == 'undefined')
        return
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://' + window.location.hostname + ':1803/getObjectIdAndKeys?entityName=' + entityName + '&entityType=' + entityType + '&keys=' + keys + '&entityID=' + entityID, true);
    xhr.send();
    xhr.onload = answer;

    function answer() {
        let answerColors = (JSON.parse(xhr.responseText)).productList || []
        try { answerColors = JSON.parse(answerColors) } catch (e) { }

        colors = {}

        for (let i = 0; i < answerColors.length; i++) {
            colors[answerColors[i].key] = answerColors[i].color
        }
    }
}

function arrayToElement(array) {
    const qty = array.length
    let products = {}

    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] == 'undefined')
            continue
        let element = (JSON.parse(array[i][1])).products

        for (let r in element) {
            if (typeof products[r] == 'undefined') {
                products[r] = element[r]
            } else {
                products[r].ts += element[r].ts
                products[r].percent += element[r].percent
            }
        }
    }

    let allPercent = 0
    for (let r in products) {
        products[r].percent = parseFloat((products[r].percent / qty))
        allPercent += products[r].percent
    }
    if (allPercent < 99 || allPercent > 101) {
        let shift = (100 - allPercent) / Object.keys(products).length
        for (let r in products) {
            products[r].percent += shift

        }
    }
    return products
}

function toListOfElements(states) {
    let resultList = {}
    let resultList_2 = {}

    if (colors === false) {
        return
    }

    for (let key in states) {
        let element = states[key]

        resultList[key] = { percent: element.percent }
        resultList[key].backgroundColor = colors[key]
        resultList_2[key] = { percent: element.percent }
        resultList_2[key].backgroundColor = colors[key]
        resultList_2[key].duration = element.ts

        let duration = element.ts / 3600000

        if (duration > 1) {
            duration = duration.toFixed(0) + ' ч'
        }
        else {
            duration = element.ts / 60000
            duration = duration.toFixed(0) + ' м'
        }

        resultList[key].label = `${element.label} ${element.percent.toFixed(0)}%  ${duration}`
        resultList_2[key].label = `${element.label}`
    }

    self.ctx.$scope.legendList = []
    self.ctx.$scope.minutesSum = 0
    self.ctx.$scope.percentSum = 0
    self.ctx.$scope.sumHour = 0

    for (var key in resultList_2) {
        let hours = parseInt((parseInt(resultList_2[key].duration) / 3600000).toFixed(1))
        self.ctx.$scope.legendList.push(resultList_2[key])
        self.ctx.$scope.percentSum += parseFloat(resultList_2[key].percent)

        // в сумму часов добавлять часы из минут 
        self.ctx.$scope.sumHour = self.ctx.$scope.sumHour + hours
        resultList_2[key].hour = hours

        if (hours > 0) {
            // получаю минуты оставшиеся от общее количество - часы
            resultList_2[key].minites = parseInt(resultList_2[key].duration / 60000) - (hours * 60)

            if (resultList_2[key].minites < 0)
                resultList_2[key].minites = 0

            self.ctx.$scope.minutesSum = self.ctx.$scope.minutesSum + parseInt(resultList_2[key].duration / 60000) - (hours * 60)

            if (self.ctx.$scope.minutesSum < 0)
                self.ctx.$scope.minutesSum = 0

        } else {
            resultList_2[key].minites = parseInt(resultList_2[key].duration / 60000)
            if (resultList_2[key].minites < 0)
                resultList_2[key].minites = 0
            self.ctx.$scope.minutesSum = self.ctx.$scope.minutesSum + parseInt(resultList_2[key].duration / 60000)
        }

    }

    if (parseFloat(self.ctx.$scope.percentSum.toFixed(2)) === parseInt(self.ctx.$scope.percentSum))
        self.ctx.$scope.percentSum = parseInt(self.ctx.$scope.percentSum)
    else
        self.ctx.$scope.percentSum = self.ctx.$scope.percentSum.toFixed(2)

    if (self.ctx.$scope.minutesSum > 59) {
        self.ctx.$scope.sumHour += Math.trunc(self.ctx.$scope.minutesSum / 60)
        self.ctx.$scope.minutesSum = self.ctx.$scope.minutesSum % 60
    }

    let reLegendList = self.ctx.$scope.legendList
    self.ctx.$scope.legendList = null
    self.ctx.$scope.legendList = reLegendList

    function msToTime(duration) {
        let milliseconds = parseInt((duration % 1000) / 100),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)))

        hours = (hours < 10) ? "0" + hours : hours
        minutes = (minutes < 10) ? "0" + minutes : minutes

        self.ctx.$scope.sumHour = hours
        self.ctx.$scope.minutesSum = minutes

        return hours + ":" + minutes
    }

    if (typeof self.ctx != 'undefined' && typeof self.ctx.dashboardTimewindow.history != 'undefined') {
        let timeFrom = self.ctx.dashboardTimewindow.history.fixedTimewindow.startTimeMs
        let timeTo = self.ctx.dashboardTimewindow.history.fixedTimewindow.endTimeMs
        let different = timeTo - timeFrom

        msToTime(different)
    }


    $('#smallLegendTable_reciept').html(` <tr>
               <td></td>
               <td></td>
               <td id="smallLegendPercentSum_reciept">Всего:&nbsp;{{percentSum}}(%)</td>
               <td id="smallLegendSumHour_reciept">&nbsp; {{sumHour | number:'1.0-0'}}(ч)</td>
               <td id ="smallLegendMinutesSum_reciept">&nbsp;{{minutesSum}}(м)</td>
            </tr>`)
    $('#smallLegendPercentSum_reciept').html(`Всего:&nbsp;${self.ctx.$scope.percentSum}(%)`)
    $('#smallLegendSumHour_reciept').html(`&nbsp;${self.ctx.$scope.sumHour}(ч)`)
    $('#smallLegendMinutesSum_reciept').html(`&nbsp;${self.ctx.$scope.minutesSum}(м)`)

    let html = ``
    for (let i = 0; i < self.ctx.$scope.legendList.length; i++) {
        let item = self.ctx.$scope.legendList[i]
        item.percent = item.percent.toFixed(2).replace('.', ',')
        html =
            `
            <tr>
               <td>${item.label}</td>
               <td style="background-color: ${item.backgroundColor}; width:40px">&nbsp;&nbsp;</td>
               <td>${item.percent}</td>
               <td>${item.hour}</td> 
               <td>${item.minites}</td> 
            </tr>
        `
        $('#smallLegendTable_reciept').append(html)
    }

    self.onResize()
    self.ctx.$scope.trackFn()

    //ToDo Опрашивать у сервера названия и цвета стейтов
    return resultList
}

function toChartDataset(states) {
    let template = {
        labels: [],
        datasets: [{
            label: '',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1
        }]
    }

    for (let key in states) {
        template.datasets[0].backgroundColor.push(states[key].backgroundColor)
        template.labels.push(states[key].label)
        template.datasets[0].data.push(states[key].percent.toFixed(2))
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
    const dataArray = self.ctx.data[0].data
    let states = {}

    try {
        states = arrayToElement(dataArray)// Получаем один элемент
    } catch (e) {
        // console.log(e)
    }

    let legendElements = []
    try {
        legendElements = toListOfElements(states)
        //Получаем проценты,цвета, лейблы только нужных нам стейтов
    } catch (e) {
        // console.log(e)
    }
}

self.onResize = function () { }
self.onEditModeChanged = function () { }
self.onMobileModeChanged = function () { }
self.getSettingsSchema = function () { }
self.getDataKeySettingsSchema = function () { }
self.onDestroy = function () { }