var uuid = uuidv4()
var ctx = false
var myChart = false

const datasourceSchema = {
    0: {key: 'oeeDounat', type: 'float'},
    1: {key: 'firstRawLegend', type: 'float'},
    2: {key: 'secondRawLegend', type: 'float'},
    3: {key: 'trendLegend', type: 'float'},
}

const dataSchema = {}

for (let index in datasourceSchema) {
    const {key} = datasourceSchema[index]
    let label, value, values
    dataSchema[key] = {
        label,
        value,
        values
    }
}

function validateType(element, type, keyType) {
    switch (type) {
        case 'integer':
            return parseInt(keyType ? element.value : element)
        case 'float':
            return parseFloat(keyType ? element.value : element)
        case 'json':
            try {
                return JSON.parse(keyType ? element.value : element)
            } catch (e) {
                return keyType ? element.value : element
            }
        default:
            return keyType ? element.value : element;
    }
}

/*
* data = self.ctx.data
* Each element of data - element of datasourceSchema
* Inside data[index] - needed data for this key (label, value, etc...)
*/

function parsingSelfDataToSchema(data) {
    data.forEach((element, index) => {
        const {key: schemaKey, type: dataType} = datasourceSchema[index]
        const {label} = element.dataKey
        let keyType;
        try {
            keyType = element.data[0][1].keyType
        } catch (e) {
        }
        if (keyType !== 'hide') {
            dataSchema[schemaKey] = {
                ...dataSchema[schemaKey],
                label,
                keyType,
                values: element.data.map(value => value ? validateType(value[1], dataType, keyType) : undefined),
                value: (element.data && element.data[element.data.length - 1])
                    ? validateType(element.data[element.data.length - 1][1], dataType, keyType)
                    : undefined
            }
        }
    })
    return dataSchema;
}


self.onInit = function () {
    self.ctx.datasourceTitleCells = [];
    self.ctx.valueCells = [];
    self.ctx.labelCells = [];
    self.onResize();
    $('#nouuid').attr('id', uuid)

    ctx = $(`#${uuid} > .box > #myChart_small`)[0].getContext('2d');

    initChart(ctx)

    $(document).click((event) => {
        if (event.target.className === 'horizontalNavigation' && event.target.nodeName === 'A' ||
            event.target.nodeName === 'H4')
            myChart.destroy()
    })

}

function initChart(ctx) {
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                label: '',
                data: [],
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
            },
            animation: {
                animateRotate: false
            }
        },
    })
}

function htmlTableForming() {
    const {
        firstRawLegend,
        secondRawLegend,
        trendLegend,
        oeeDounat: {value: oeeDounatValue}
    } = dataSchema;
    let tableForOEE = ``

    $(`#${uuid} > .box > #info_center`).html(`${oeeDounatValue}%`)
    if (firstRawLegend.label !== 'hide') {
        tableForOEE += `
            <tr> <td style="font-size: 14px;">${firstRawLegend.label}:</td> </tr>
            <tr> <td style="font-size: 22px; font-weight: bold;">
                ${
            (firstRawLegend.keyType === 'minutes')
                ? msToTime(firstRawLegend.value * 60000)
                : (firstRawLegend.keyType === 'units')
                ? formatter(firstRawLegend.value) : firstRawLegend.value
        }
            </td></tr>
        `
    }
    if (secondRawLegend.label !== 'hide') {
        tableForOEE += `
            <tr> <td style="font-size: 14px;">${secondRawLegend.label}:</td> </tr>
            <tr> <td style="font-size: 22px; font-weight: bold;">
               ${
            (secondRawLegend.keyType === 'minutes')
                ? msToTime(secondRawLegend.value * 60000)
                : (secondRawLegend.keyType === 'units')
                ? formatter(secondRawLegend.value) : secondRawLegend.value
        }
            </td></tr>
        `
    }


    $(`#${uuid} > .box > #oee_small`).html(tableForOEE)
    console.log(dataSchema)
    $(`#${uuid} > .trendText`).html(trendLegend.label)
    let iconTrend = `<i class="fa fa-arrow-up"></i>`
    if (parseFloat(trendLegend.value) < 0) {
        iconTrend = `<i class="fa fa-arrow-down"></i>`
        $(`#${uuid} > #info_in_bottom`).css('color', 'red')
    } else
        $(`#${uuid} > #info_in_bottom`).css('color', '#43C6C9')
    $(`#${uuid} > #info_in_bottom`).html(`${iconTrend} ${(typeof trendLegend.value == 'undefined') ? 'н/д' : trendLegend.value}%`)

}


function toChartDataset() {
    const {oeeDounat: {value: oeeDounatValue}} = dataSchema;
    let template = {
        labels: [],
        datasets: [{
            label: '',
            data: [oeeDounatValue, 100 - oeeDounatValue],
            //  green     green     black     green     black
            backgroundColor: ['#43C6C9', '#43434c'],
            borderColor: [],
            borderWidth: 1
        }]
    }
    return template
}

function checkAndUpdateChart(data) {

    const oldDatasets = myChart.config.data.datasets[0].data
    const newDatasets = data.datasets[0].data
    let changed = false
    for (let i = 0; i < newDatasets.length; i++) {
        if (typeof oldDatasets[i] == 'undefined' || oldDatasets[i] != newDatasets[i])
            changed = true
    }

    if (changed) {
        myChart.config.data = data
        myChart.update();
    }
}

self.onDataUpdated = function () {

    $(`.tb-widget-loading`).hide() // скрыть лоадер

    parsingSelfDataToSchema(self.ctx.data)
    try {
        htmlTableForming() // Получаем один элемент
    } catch (e) {
        console.log('error in htmlTableForming', e)
    }
    const chartTemplate = toChartDataset()
    checkAndUpdateChart(chartTemplate)


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

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


self.onResize = function () {
}

self.onDestroy = function () {
    myChart.destroy()
}
