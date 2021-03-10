let isFirstReq = true
let timeTo
let timeFrom

function declOfNum(number, titles) {
    cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

function getData() {

    const entities = {}

    ctx.data.forEach((element) => {
        if (element.datasource.entityType !== 'DEVICE')
            return

        const id = element.datasource.entityAliasId
        const name = element.datasource.name
        const key = element.dataKey.name
        let value = element.data[element.data.length - 1]?.[1]
        try {
            value = JSON.parse(value)
        } catch (e) {
        }

        if (!entities[name]) {
            entities[name] = {id, name}
        }
        entities[name][key] = value
    })


    for (let machine in entities) {
        ctx.deviceService.findByName(machine).subscribe(device => {
            ctx.attributeService.getEntityAttributes({id: device.id.id, entityType: 'DEVICE'}, 'SERVER_SCOPE', [
                "imgBase64", "factoryNumber", "visibleAttributes", "statesList"]).subscribe(atributes => {
                atributes.forEach(({key, value}) => {
                    try {
                        value = JSON.parse(value)
                    } catch (e) {
                    }
                    entities[device.name][key] = value
                })
                drawTable(entities)
            })
        })
    }

}

// setInterval(()=>{
//     if (isFirstReq)
//         return
//     let timeFromNew
//     let timeToNew

//     if(typeof self.ctx == 'undefined')
//         return

//     if(typeof self.ctx.dashboardTimewindow.realtime !== 'undefined' && typeof self.ctx !== 'undefined'){
//         let timeShift = self.ctx.dashboardTimewindow.realtime.timewindowMs
//          timeFromNew = Date.now() - timeShift
//          timeToNew = Date.now()
//     }else if(typeof self.ctx !== 'undefined') {
//          timeFromNew = self.ctx.dashboardTimewindow.history.fixedTimewindow.startTimeMs
//          timeToNew = self.ctx.dashboardTimewindow.history.fixedTimewindow.endTimeMs
//     }

//     if(Math.abs(timeFromNew - timeFrom) < 11000 && Math.abs(timeToNew - timeTo) < 11000)
//         return


//     timeTo = timeToNew
//     timeFrom = timeFromNew
//     self.onDataUpdated(true)
//     //  console.log('ПРОШЛИ')

// },300)

// setInterval(function() {
//       self.onDataUpdated(true)
// },10000)

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

function drawTable(data) {
    let tableHTML;
    let isAnyChanges = false

    var tableForInfo = ``
    var tableForParameters = ``
    var tableForOEE = ``

    const statesImgs = {
        "0": `<img style="width: 11px;  margin: 4px 7px 0 0; " src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAgCAYAAAASYli2AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC8SURBVHgB7ZbBDcIwDEWdTtIRMiIbABPACkzQbgIbhA2MLYIaIvu3h/bmL6WK7JenNocmRBJmzjImGYW/0flITiBfm79GG61lR+bz1e5lMoSQT/okkCTphJAfZLxB/2XUIK/CKwAeRm2dl6+4GPtx91YhPjXQ3970e2dITX6gnRPCEIYwhCFshPLzvfUNqZ29RZDXCThnT9ZCyMvjCYBiCCF/yEE/g/68sbb0eO/LUoVGXi5Bpc6z9xqI/wA78ekPPbVOHwAAAABJRU5ErkJggg==">`,
        "5": `<img style="width: 25px;  margin: 2px 5px 0 0; " src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEaSURBVHgB7dfhDYIwEIbhbwRHYARHYARGYBQ30A1kA92AERyhIzhCbZMjNgqUwpXU+D1JE3+YO16VBAEiIiIiIiqMtfbgTuNOhV/lL94dY99a5CCfVu3OEcpGIrw7tLmh548lRitoIsK7QNNIxOC59bc8E9FBkyyas/pT2y1CljWREIMVdo2QhXUkpEei3SNk6TUS4u+TxTd9qRFJMSVFPOVCTGpMSRH+IqrgPaelMcVGpMQUH7EgpnfnIa/LjojETOmQy5YIpMV0yEUjIphlIiHqT83D4qtWhMwzkZAa2uz4E61ZGyEz+0jIAdrc0JtmhMycey7T/W8RLG01I4K5jf3+ieWJCJZWslj9K5dvp80xm4iIiIjoP7wALerdhix9EWYAAAAASUVORK5CYII=">`,
        "6": `<img style="width: 11px;  margin: 4px 7px 0 0; " src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAgCAYAAAASYli2AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC8SURBVHgB7ZbBDcIwDEWdTtIRMiIbABPACkzQbgIbhA2MLYIaIvu3h/bmL6WK7JenNocmRBJmzjImGYW/0flITiBfm79GG61lR+bz1e5lMoSQT/okkCTphJAfZLxB/2XUIK/CKwAeRm2dl6+4GPtx91YhPjXQ3970e2dITX6gnRPCEIYwhCFshPLzvfUNqZ29RZDXCThnT9ZCyMvjCYBiCCF/yEE/g/68sbb0eO/LUoVGXi5Bpc6z9xqI/wA78ekPPbVOHwAAAABJRU5ErkJggg==">`
    }

    for (let entity in data) {

        // console.log('data[entity]', data[entity])

        const name = data[entity].name
        const id = data[entity].id

        for (let key in data[entity]) {
            const keyType = key
            let value = data[entity][key]

            if (value === undefined)
                value = '-'

            switch (key) {
                case 'imgBase64':
                    let nowImg = `<img class="mainImg" src="${value}"/>`;
                    let oldImg = $('#img').html()
                    oldImg = oldImg.slice(oldImg.indexOf("src=") + 5)
                    oldImg = oldImg.slice(0, oldImg.indexOf(">") - 1)
                    if (oldImg != value)
                        $('#img').html(nowImg)
                    break;

                case 'qtyErrorsNow':
                    const qtyErrors = $('#qtyErrorsNowText')

                    if (parseInt(value) < 0 || !value)
                        value = 0

                    qtyErrors.html(`${value} Активные события`)
                    qtyErrors.parent().css({'background-color': '#B5393F'})

                    if (value < 1) {
                        qtyErrors.parent().css({'background-color': 'gray'})
                    }
                    break;

                case 'universalStateNew':
                    const statesList = data[entity].statesList
                    if (typeof value == 'undefined')
                        value = '6'
                    statesList.forEach(state => {
                        if (state.universalState.toString() == value.toString()) {
                            let img = statesImgs[value.toString()] || '<img>'
                            $('.nowStatus').css({"background-color": state.color})
                            $('#nowStatusImg').html(img)
                            $('#nowStatusText').html(state.name)
                        }
                    })
                    break;

                case 'name':
                    tableForInfo += `
                    <tr> 
                        <td colspan="5" style="font-size: 14px; font-weight:bold">${value || 'н&nbsp;/&nbsp;д'}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr> `
                    break;

                case 'factoryNumber':
                case 'fullFilledProduct':
                case 'hourMeter':
                case 'productLabel':

                    tableForInfo += `
                    <tr> 
                        <td colspan="5" style="font-size: 14px; font-weight:bold">${
                        key == 'factoryNumber' ? 'Инвентарный номер' :
                            key == 'fullFilledProduct' ? 'Общий произведенный продукт' :
                                key == 'hourMeter' ? 'Время работы' :
                                    key == 'productLabel' ? 'Текущий рецепт' : key}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td style="font-size: 14px; text-align: right;">${value || 'н&nbsp;/&nbsp;д'}</td>
                    </tr>`
                    break;

                case 'oee':
                case "oee_availability":
                case "oee_productivity":
                case "oee_quality":

                    tableForOEE += `
                    <tr style="">
                        <td colspan="3" style="font-size: 14px; font-weight:bold">${
                        key == 'oee' ? 'ОЕЕ' :
                            key == 'oee_availability' ? 'Доступность' :
                                key == 'oee_productivity' ? 'Производительность' :
                                    key == 'oee_quality' ? 'Качество' : key}</td>
                        <td></td> 
                        <td></td> 
                        <td></td> 
                        <td style="font-size: 14px; text-align: right;">
                            ${value.value == null ?
                        'н&nbsp;/&nbsp;д' : value.value == undefined ?
                            'н&nbsp;/&nbsp;д' : value.value + '%'}
                        </td> 
                    </tr> 
                `
                    tableForOEE += `
              <span class="parameter_name">${
                        key == 'oee' ? 'ОЕЕ' :
                            key == 'oee_availability' ? 'Доступность' :
                                key == 'oee_productivity' ? 'Производительность' :
                                    key == 'oee_quality' ? 'Качество' : key}
                  <span>
                        &nbsp;${value.value == null ?
                        'н&nbsp;/&nbsp;д' : value.value == undefined ?
                            'н&nbsp;/&nbsp;д' : value.value + '%'}
                  </span>
              </span>
               
              <span id="inWork">`

                    for (let key in value) {
                        if (key == 'value' || key == 'trend')
                            continue;

                        if (key == 'OT' || key == 'NOT') {
                            value[key] = value[key] ? msToTime(value[key] * 60000) : 0
                        }

                        tableForOEE += `
                    <td  style="font-size: 12px; color: #c1c0c0;">${
                            key == 'TP' ? 'Факт' :
                                key == 'DP' ? 'Брак' :
                                    key == 'OT' ? 'Работа' :
                                        key == 'NOT' ? 'Простой' :
                                            key == 'TPP' ? 'План' :
                                                key == 'GP' ? 'Норма' :
                                                    key} : ${value[key]}</td>`
                    }

                    tableForOEE += `</tr>`

                    break;

                // parameters
                case 'visibleAttributes' :
                    value.forEach(item => {
                        if (item.inInformation == 'true') {
                            // console.log('item', item)
                            // data[entity][item.key]
                            // console.log('item', item.key)

                            tableForParameters += `
                          <tr> 
                            <td colspan="5" style="font-size: 14px; font-weight:bold">${item.name}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td style="font-size:14px; text-align:right;">${+data[entity][item.key]?.toFixed?.(2) || 'н&nbsp;/&nbsp;д'}</td>
                          </tr> `
                        }
                    })

                    break;


            }

        }

//       if(!isNaN(value)){
//           if(value % 1 !== 0)
//                 value = value.toFixed(2)
//       }

//     //   tableHTML +=`
//     //         <tr>
//     //             <td class="leftColumn" id="${key+'Key'}">${name}</td>
//     //             <td class="spacer"></td>
//     //             <td class="rightColumn" id="${key+'Value'}">${value}</td>
//     //       </tr>
//     //       <tr id="row_header"> <td colspan="3"></td> <td></td> <td></td> </tr>
//     //   `
    }

    //if(!isImg)

    //let oldTable = $('#dynamicTableAttrs').html().replace(/\s/g,"").replace('undefined',"")

    /*let oldHeader = $('#headerTableAttrs').html().replace(/\s/g,"")

    if(oldHeader.replace(/\s/g,"").replace('undefined',"") !== keyValueJson.name.replace(/\s/g,"").replace('undefined',"")){
        //Подставляем иконку /надпись - работа/простой
        $('#headerTableAttrs').html(keyValueJson.name)
    }

    */
    //if(oldTable.replace(/\s/g,"") !== tableHTML.replace(/\s/g,"").replace('undefined',""))
    // $('#dynamicTableAttrs').html(tableHTML)

    $('#info').html(tableForInfo)
    $('#parameters').html(tableForParameters)
    $('#oee').html(tableForOEE)
}

self.onInit = function () {
    self.ctx.datasourceTitleCells = [];
    self.ctx.valueCells = [];
    self.ctx.labelCells = [];
    self.onResize();

}

self.onDataUpdated = function (force) {

    let jsonKeys = []
    let entityType;
    let entityName;
    let entityID;

    if (!self.ctx)
        return

    const requiredKeys = [
        {"name": "Фото", "key": "imgBase64"},
        {name: "Таблетный пресс", key: "name", type: "info"},
        {name: "Количество ошибок", key: "qtyErrorsNow", type: "info"},
        {name: "Инвентарный номер", key: "factoryNumber", type: "info"},
        {name: "Текущее состояние", key: "universalStateNew"},
        {name: "Время работы", key: "hourMeter", type: "info"},
        {name: "Текущий рецепт", key: "productLabel", type: "info"},
        {name: "Общий произведенный рецепт", key: "fullFilledProduct", type: "info"}
    ]

    getData()

}

self.onResize = function () {
}

self.onDestroy = function () {
}
