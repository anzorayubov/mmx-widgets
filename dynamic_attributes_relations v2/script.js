let statesInfo = {}
const log = (text='', data) => console.log(text, data)

function getData() {
    const entities = {}

    ctx.data.forEach((element) => {
        if(element.datasource.entityType !== 'DEVICE')
            return

        const id = element.datasource.entityAliasId
        const name = element.datasource.name
        const key = element.dataKey.name
        let value = element.data[0]?.[1]
        try {value = JSON.parse(value) } catch (e) {}

        if(!entities[name]) {
            entities[name] = { id, name }
        }
        entities[name][key] = value
    })
    // log('entities', entities)
    drawTable(entities)
}

function jqueryActions (){
    $(document).undelegate(".sectionNameHeader",'click')
    $(document).undelegate(".entityNameHeader",'click')
    $(document).delegate(".entityNameHeader",'click',function (e) {
        e.preventDefault();
        const machineStatesMap = {
            "Обандероливающая CHRIST" :'christ',
            "Смешивание РМ 1000-L.B.BOHLE":'bohle',
            "Таблетирование XL 400 FT-KORSCH AG":'korsch',
            "Картонирующая CMP-100-Heino Ilsemann":'cmp_100_heino_ilsemann',
            "Насыщение HDGC100-HUTTLIN":'huttlin',
            "Блистерная BMP-250R-Heino Ilsemann":'bmp_250r_heino_ilsemann',
        }
        let thisClick = e.currentTarget.attributes

        let entityName = e.currentTarget.innerHTML
        entityName = (entityName.match(/\<\/i\>(.+)<\/h4>/))[1]

        let entityDescriptor

        try{
            entityDescriptor = {
                id:thisClick.entity_id.value,
                entityType:thisClick.entitytype.value
            }
        }catch(e){console.log('machine descriptor err'),e}

        let actionDescriptor = self.ctx.actionsApi.getActionDescriptors('elementClick')[0]
        actionDescriptor.targetDashboardStateId = machineStatesMap[entityName]+'_main'
        console.log('try to go to', actionDescriptor.targetDashboardStateId)
        try{
            $(document).undelegate("#paginatorNext, #paginatorPrev",'click')
            $(document).undelegate(".accordeon > li > a, .lineLevel > li > a",'click')
            $(document).undelegate("[entityid]",'click')
            $(document).undelegate(".sectionNameHeader",'click')
            $(document).undelegate(".entityNameHeader",'click')
        }catch(e){console.log('machine undelegate err'),e}


        try{
            self.ctx.actionsApi.handleWidgetAction(e, actionDescriptor, entityDescriptor, entityName);
        }catch(e){console.log('machine navigate err'),e}
    });
}

function declOfNum(number, titles) {
    cases = [2, 0, 1, 1, 1, 2];
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
}

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
        days = (duration / (1000 * 60 * 60 * 24)).toFixed(1) < 1 ? '' : (duration / (1000 * 60 * 60 * 24)).toFixed(0)

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    hours = hours === '00' ? 0 : hours

    if (days === '' && hours !== 0) {
        return `${hours.toString().substr(0,1) === '0' ?
            hours.toString().slice(1) :
            hours}<span style="font-size:12px">ч:</span>${minutes}<span style="font-size:12px">м</span>`
    } else if(hours === '0') {
        return `${minutes.toString().substr(0,1) === 0 ?
            minutes.toString().slice(1) :
            minutes}<span style="font-size:12px">м</span>`
    } else {
        return `${days}<span style="font-size:12px">д:</span>${hours.toString().substr(0,1) === '0' ?
            hours.toString().slice(1) :
            hours}<span style="font-size:12px">ч:</span>${minutes.toString().substr(0,1) === 0 ?
            minutes.toString().slice(1) :
            minutes}<span style="font-size:12px">м</span>`
    }
}

function drawTable(data){

    $('#entitiesTables').empty()
    console.log('empty')
    for(let entity in data) {
        const name = entity
        const entityNameID = entity.replace(/(\s|\.)/g,"")
        $('#entitiesTables').append(`
            <div id=${entityNameID} class="entityDiv">
                <div id="${entityNameID}_entityName" class="entityNameHeader"></div>
                <div id="${entityNameID}_headerTableAttrs" class="headerTableAttrs">
                    <div id="${entityNameID}_nowStatus" class="nowStatus">
                        <div id="${entityNameID}_nowStatusImg"></div>
                        <div id="${entityNameID}_nowStatusText" class="nowStatusText"></div>
                    </div>
                	<div class="qtyErrorsNow">
                	    <div id="${entityNameID}_qtyErrorsNowImg">
                	       <img style="width: 25px; margin:0 5px 0 0; " src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACXSURBVHgB7ZFbDYAwDEUbggAkIAEJSEACTpACDpAwHICD4WA4KCWMZBQWHun+dpKbPdrspBlAJBIcRGwoLYSCHs8oGneCivI3ItunthX+8CRidS0uYvdGXMTOo/3DTlqErsDpERedBD6RnbKmVF9F/Z3AIyqPPUjjiAyXJCCAnbKjTJTLxCnIUFCUryglWSgDu5shEgnOCpO8NEm2fgk/AAAAAElFTkSuQmCC">
                	    </div>
                        <div id="${entityNameID}_qtyErrorsNowText" class="qtyErrorsNowText"></div>
                	</div>
                </div>
                <div class="box">
                    <div id='${entityNameID}_img' class="entityImg"></div>
                    <div id='${entityNameID}_oee' class="column"></div>
                </div>
            </div>
        `)

        let tableForInfo = ``
        let tableForParameters = ``
        let tableForOEE = ``
        let id

        for(let key in data[entity]) {

            let name = data[entity][key]?.name
            id = data[entity][key]?.id
            let keyType = key;
            let value = data[entity][key]

            if (key === 'oee' || key === 'oee_availability' || key === 'oee_productivity' || key === 'oee_quality') {
                if(value == undefined)
                    continue

                tableForOEE += `
              <span class="parameter_name">${
                    key==='oee' ? 'ОЕЕ':
                        key==='oee_availability' ? 'Доступность':
                            key==='oee_productivity' ? 'Производительность':
                                key==='oee_quality' ? 'Качество': key}
                  <span>
                        &nbsp;${value.value == null ?
                    'н&nbsp;/&nbsp;д' : value.value == undefined ?
                        'н&nbsp;/&nbsp;д' : value.value + '%'}
                  </span>
              </span>
               
              <span id="inWork">
              `
                for (let key in value) {
                    if(key ==='value' || key==='trend')
                        continue;
                    if(value[key] == null)
                        value[key] = 0
                    tableForOEE += `
                    <span style="font-size: 12px; color: #c1c0c0;">${
                        key==='TP' ? 'Факт':
                            key==='DP' ? 'Брак':
                                key==='OT' ? 'Работа':
                                    key==='NOT' ? 'Простой':
                                        key==='TPP' ? 'План':
                                            key==='GP' ? 'Норма':
                                                key==='good' ? 'Норма':
                                                    key==='bad' ? 'Брак':
                                                        key } : ${(key==='OT' || key==='NOT') ? msToTime(value[key]*60000) : value[key]}</span>`
                }
                tableForOEE += `</span>`

            }

            if(key ==='imgBase64') {
                let nowImg = `<img class="mainImg" src="${value}"/>`;
                $(`#${entityNameID}_img`).html(nowImg)
                continue;
            }

            if(key === 'qtyErrorsNow') {
                if(parseInt(value) < 0)
                    value = 0
                $(`#${entityNameID}_qtyErrorsNowText`).html(`${value} Активные события`)
                $(`#${entityNameID}_qtyErrorsNowText`).parent().css({'background-color':'#B5393F'})

                if (value < 1 ) {
                    $(`#${entityNameID}_qtyErrorsNowText`).parent().css({'background-color':'gray'})
                }
                continue
            }

            if(key === 'universalStateNew') {
                for(let state in statesInfo){
                    if(statesInfo[state].codeState == value){
                        value = state
                        let img = '<img>'
                        switch(statesInfo[state].nameState){
                            case "error":
                                img = '<span style="font-size: 25px; margin-right: 7px; font-weight: bold;" >!</span>'
                                $(`#${entityNameID}_nowStatus`).css({"background-color":"#B5393F","color":"#fff"})
                                break;
                            case "plain":
                                img = '<img style="width: 11px;  margin: 4px 7px 0 0; " src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAgCAYAAAASYli2AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC8SURBVHgB7ZbBDcIwDEWdTtIRMiIbABPACkzQbgIbhA2MLYIaIvu3h/bmL6WK7JenNocmRBJmzjImGYW/0flITiBfm79GG61lR+bz1e5lMoSQT/okkCTphJAfZLxB/2XUIK/CKwAeRm2dl6+4GPtx91YhPjXQ3970e2dITX6gnRPCEIYwhCFshPLzvfUNqZ29RZDXCThnT9ZCyMvjCYBiCCF/yEE/g/68sbb0eO/LUoVGXi5Bpc6z9xqI/wA78ekPPbVOHwAAAABJRU5ErkJggg==">'

                                $(`#${entityNameID}_nowStatus`).css({"background-color":"#D2AA19","color":"#fff"})
                                break;
                            case "noConnection":
                                img = '<img style="width: 11px;  margin: 4px 7px 0 0; " src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAgCAYAAAASYli2AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC8SURBVHgB7ZbBDcIwDEWdTtIRMiIbABPACkzQbgIbhA2MLYIaIvu3h/bmL6WK7JenNocmRBJmzjImGYW/0flITiBfm79GG61lR+bz1e5lMoSQT/okkCTphJAfZLxB/2XUIK/CKwAeRm2dl6+4GPtx91YhPjXQ3970e2dITX6gnRPCEIYwhCFshPLzvfUNqZ29RZDXCThnT9ZCyMvjCYBiCCF/yEE/g/68sbb0eO/LUoVGXi5Bpc6z9xqI/wA78ekPPbVOHwAAAABJRU5ErkJggg==">'

                                $(`#${entityNameID}_nowStatus`).css({"background-color":"#EAEAEA","color":"#fff"})
                                break;
                            case "work":
                                img = '<img style="width: 25px;  margin: 2px 5px 0 0; " src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEaSURBVHgB7dfhDYIwEIbhbwRHYARHYARGYBQ30A1kA92AERyhIzhCbZMjNgqUwpXU+D1JE3+YO16VBAEiIiIiIiqMtfbgTuNOhV/lL94dY99a5CCfVu3OEcpGIrw7tLmh548lRitoIsK7QNNIxOC59bc8E9FBkyyas/pT2y1CljWREIMVdo2QhXUkpEei3SNk6TUS4u+TxTd9qRFJMSVFPOVCTGpMSRH+IqrgPaelMcVGpMQUH7EgpnfnIa/LjojETOmQy5YIpMV0yEUjIphlIiHqT83D4qtWhMwzkZAa2uz4E61ZGyEz+0jIAdrc0JtmhMycey7T/W8RLG01I4K5jf3+ieWJCJZWslj9K5dvp80xm4iIiIjoP7wALerdhix9EWYAAAAASUVORK5CYII=">'

                                $(`#${entityNameID}_nowStatus`).css({"background-color":"#43C6C9","color":"#fff"})
                                break;

                        }
                        $(`#${entityNameID}_nowStatusImg`).html(img)
                        $(`#${entityNameID}_nowStatusText`).html(value)
                    }
                }
                continue
            }

            if(!isNaN(value)){
                if(value % 1 !== 0)
                    value = value.toFixed(2)
            }

        }

        $(`#${entityNameID}_entityName`).html(`<h4><i class="fa fa-angle-right fa-1x"></i>${name}</h4>`)
        $(`#${entityNameID}_entityName`).attr('entity_id', id)
        // $(`#${entityNameID}_entityName`).attr('entityType', keyValueJson.type)
        $(`#${entityNameID}_info`).html(tableForInfo)
        $(`#${entityNameID}_parameters`).html(tableForParameters)
        $(`#${entityNameID}_oee`).html(tableForOEE)
        $(`#${entityNameID}_oee`).append(`<span class="productLabel"></span>`)


        // добавить строку для названия продукта

        const productNames = [];
        let count = 0;

        for (let i=0; i < self.ctx.data.length; i++) {
            const data = self.ctx.data[i]
            if(!data.data[0])
                continue

            const key = data.dataKey.name
            if(key == 'productLabel') {
                const productLabel = $(`.entityDiv .box span.productLabel`)
                productNames.push(data.data[0][1])
                if (productLabel[count]) {
                    productLabel[count].innerHTML =
                        `Продукт: ${!productNames[count] ? 'н/д' : productNames[count]}`
                    count++
                }
            }
        }
    }
}

self.onInit = function() {
    jqueryActions()
    self.ctx.datasourceTitleCells = [];
    self.ctx.valueCells = [];
    self.ctx.labelCells = [];
    self.onResize();

    setInterval(function() {

    }, 60000)
}



self.onDataUpdated = function() {
    if(!self.ctx)
        return

    for (let i=0; i < self.ctx.data.length; i++) {
        const data = self.ctx.data[i]
        if(data.data[0] == undefined)
            continue
        const key = data.dataKey.name
        const value = data.data[0][1]
        const entityName = data.datasource.entityName

        if(statesInfo[entityName] == undefined)
            statesInfo[entityName] = {}
        statesInfo[entityName][key]=value
    }

    getData()

}

self.onResize = function() {}

self.actionSources = function() {
    return {
        'elementClick': {
            name: 'widget-action.element-click',
            multiple: true
        }
    };
}

self.onDestroy = function() {}
