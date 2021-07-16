const currentUser = JSON.parse(localStorage.getItem('currentUser'))
const inputEvent = new Event('input')

function drawInputs(keyName, className, optionsArray, quantityInputs) {
    const matLabel = $('.layout-wrap.vertical-alignment mat-label')
    const parentNode = $('.layout-wrap.vertical-alignment')?.[0]
    const products = getDataOf('productList')
    const parameters = getDataOf('parametersList')

    for (let label = 0; label < matLabel.length; label++) {
        if (removeSpaces(matLabel[label].innerHTML).includes(removeSpaces(keyName))) {
            let arrayWithSelectedParams = [];
            let uniqueArray = [];
            let inputOriginal = matLabel[label].closest('div').firstChild
            let container = document.createElement('div');
            container.className = `container_${className}`
            let div = document.createElement('div')
            div.className = `container_for_${className}`
            let select = document.createElement('select')
            select.classList.add(`event_select_${className}`)

            optionsArray.forEach(option => {
                select.innerHTML += `<option>${option}</option>`
            })

            const boxForDelete = document.createElement('div');
            boxForDelete.className = `boxForDelete_${className}`
            if (className === 'configuration') {
                container.append(div)
            } else {
                container.append(div, select, boxForDelete)
            }

            matLabel[label].closest('mat-form-field').append(container)
            // скрыть нативный инпут
            matLabel[label].offsetParent.offsetParent.offsetParent.offsetParent.parentNode.firstChild.style.display = 'none';

            // подгрузка и отрисовка инпутов
            for (let i = 0; i < self.ctx.data.length; i++) {
                if (removeSpaces(self.ctx.data[i].dataKey.label) === removeSpaces(keyName)) {
                    if (keyName === 'Расчет ОЕЕ') {
                        let inputLabels = {}

                        if (self.ctx.data[i].data[0][1] === '') {
                            optionsArray.forEach(option => {
                                if (option) {
                                    inputLabels[`${option.includes('Q') ?
                                        'Q_plan' : option.includes('DP') ?
                                            'DP' : option === 'PP - Плановая производств' ?
                                                'PP' : option === 'PPT - Общее доступное время, мин' ?
                                                    'PPT' : option === 'P - Плановое значение производительности' ?
                                                        'P_plan' : option.includes('A') ?
                                                            'A_plan' : option.includes('OEE') ?
                                                                'OEE_plan' : option === 'GP - Выпуск качественной продукции' ? 'GP' : option
                                    }`] = ''
                                }
                            })
                        } else {
                            try {
                                inputLabels = JSON.parse(self.ctx.data[i].data[0][1])
                            } catch (e) {
                                // console.log(e)
                            }
                        }

                        let count = 1
                        let validity = []

                        for (let key in inputLabels) {
                            uniqueArray.push(inputLabels[key])
                            let div = document.createElement('div')
                            let input = document.createElement('input')
                            input.className = `${key}`
                            input.value = inputLabels[key]
                            input.type = "number";
                            input.min = "1";
                            input.max = "100";
                            input.pattern = "^([0-9]|[1-9][0-9]|100)$" // <- сделать дробные
                            input.step = 0.1

                            div.append(input)
                            let span = document.createElement('span');
                            span.classList.add(`event_span_${className}`)
                            span.innerHTML = optionsArray[count]
                            div.prepend(span)
                            $(`.container_for_${className}`).append(div)

                            // редактирование инпутов
                            $(input).change((event) => {
                                let currentInput = event.target.className;
                                for (let item in inputLabels) {
                                    if (item === currentInput) {
                                        inputLabels[item] = event.target.value
                                    }
                                }

                                inputOriginal.value = JSON.stringify(inputLabels) // вставка объекта в нативный инпут
                                inputOriginal.dispatchEvent(inputEvent)
                            })

                            $(input).on('input', function (e) {
                                validity = []
                                if (!$(input)[0].validity.valid) {
                                    span.style.color = 'red'
                                    input.style.borderColor = 'red'
                                } else {
                                    span.style.color = 'rgb(142, 142, 142)'
                                    input.style.borderColor = 'rgb(202, 202, 202)'
                                }

                                Array.from($(input)[0].parentElement.parentElement.querySelectorAll('input')).forEach((inputt) => {
                                    validity.push(inputt.validity.valid)
                                })

                                setTimeout(() => {
                                    if (validity.includes(false) || validity == []) {
                                        $('button[type="submit"].mat-primary').prop('disabled', true)
                                    } else {
                                        $('button[type="submit"].mat-primary').prop('disabled', false)
                                    }
                                }, 500);
                            });

                            count++
                        }
                    }

                    if (self.ctx.data[i].data[0][1] !== ' ' && self.ctx.data[i].data[0][1]) {
                        let array = JSON.parse(self.ctx.data[i].data[0][1]);

                        for (let ii = 0; ii < array.length; ii++) {
                            arrayWithSelectedParams.push(array[ii])
                            uniqueArray.push(array[ii])

                            $(`.container_for_${className}`).append(`<div> <span>${array[ii].name}</span> </div>`)

                            for (let key in array[ii]) {
                                if (key.toLowerCase().indexOf('input') !== -1) {
                                    $(`.container_for_${className} div:nth-child(${ii + 1})`).append(`
                                    <input placeholder="Адрес в контроллере" class="${key}" value="${array[ii][key]}">
                                `)
                                    $(`.container_for_${className} div:nth-child(${ii + 1}) .${key}`).change((event) => {

                                        let key = event.target.closest('div').querySelector('span').innerHTML;
                                        let currentInput = event.target.className;
                                        uniqueArray.forEach((obj) => {
                                            if (obj.name === key) {
                                                obj[currentInput] = event.target.value
                                            }
                                        })

                                        inputOriginal.value = JSON.stringify(uniqueArray) // вставка массива в нативный инпут
                                        inputOriginal.dispatchEvent(inputEvent)

                                        if (keyName === 'Определение Рецепта') {
                                            fetch(`http://${window.location.hostname}:1803/getAllProductList`)
                                                .then(response => response.json())
                                                .then(recipes => {
                                                    Array.from(matLabel).forEach((item) => {
                                                        if (removeSpaces(item.innerHTML).includes('productlist')) {
                                                            let inputOriginal = item.closest('div').firstChild

                                                            for (let v = 0; v < recipes.length; v++) {
                                                                if (recipes[v].name === event.target.parentElement.firstChild.innerHTML) {
                                                                    switch (currentInput) {
                                                                        case 'input-1':
                                                                            recipes[v].address = event.target.value
                                                                            break;
                                                                        case 'input-2':
                                                                            recipes[v].PP = event.target.value
                                                                            break;
                                                                        case 'input-3':
                                                                            recipes[v].value = event.target.value
                                                                            break;
                                                                    }
                                                                }

                                                                Array.from(event.target.closest(`.container_for_recipes`).querySelectorAll('span')).forEach((span) => {
                                                                    let checkArray = products.map((p) => p.name)

                                                                    if (recipes[v].name === span.innerHTML && !checkArray.includes(span.innerHTML)) {
                                                                        products.push(recipes[v])
                                                                    } else if (recipes[v].name === span.innerHTML && products.length !== 0) {
                                                                        products.forEach((i) => {
                                                                            if (i.name === event.target.parentElement.firstChild.innerHTML) {
                                                                                switch (currentInput) {
                                                                                    case 'input-1':
                                                                                        i.address = event.target.value
                                                                                        break;
                                                                                    case 'input-2':
                                                                                        i.PP = event.target.value
                                                                                        break;
                                                                                    case 'input-3':
                                                                                        i.value = event.target.value
                                                                                        break;
                                                                                }
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                            }

                                                            inputOriginal.value = JSON.stringify(products) // вставка в нативный инпут
                                                            inputOriginal.dispatchEvent(inputEvent)
                                                        }
                                                    })
                                                })
                                        }

                                        if (keyName === 'Набор технологических  параметров') {
                                            fetch(`http://${window.location.hostname}:1803/getAllParametersList`)
                                                .then(response => response.json())
                                                .then(recipes => {
                                                    Array.from(matLabel).forEach((item) => {
                                                        if (removeSpaces(item.innerHTML).includes('parameterslist')) {
                                                            let inputOriginal = item.closest('div').firstChild

                                                            recipes.forEach((recip) => {
                                                                if (recip.name === event.target.previousElementSibling.innerHTML) {
                                                                    recip.address = event.target.value
                                                                }
                                                                Array.from(event.target.closest('.container_for_params').querySelectorAll('span')).forEach((span) => {
                                                                    if (recip.name === span.innerHTML && parameters == []) {
                                                                        parameters.push(recip)
                                                                    } else {
                                                                        parameters.forEach((i) => {
                                                                            if (i.name === event.target.previousElementSibling.innerHTML) {
                                                                                i.address = event.target.value
                                                                            }
                                                                        })
                                                                    }

                                                                })
                                                            })

                                                            inputOriginal.value = JSON.stringify(parameters) // вставка в нативный инпут
                                                            inputOriginal.dispatchEvent(inputEvent)
                                                        }
                                                    })
                                                })
                                        }

                                    })

                                    // удалить option из селекта
                                    for (let j = 0; j < $(`.event_select_${className} option`).length; j++) {
                                        if ($(`.event_select_${className} option`)[j].value === array[ii].name)
                                            $(`.event_select_${className} option`)[j].remove()
                                    }

                                } else if (key === 'inInformation') {
                                    $(`.container_for_${className} div:nth-child(${ii + 1})`).append(`
                                    <input type="checkbox" class="${key}" >`)

                                    let checkbox = $(`.container_for_${className} div:nth-child(${ii + 1}) .${key}`)

                                    $(checkbox).prop('checked', array[ii][key] === 'false' ? '' : array[ii][key])

                                    checkbox.change((event) => {
                                        let key = event.target.closest('div').querySelector('span').innerHTML;
                                        let currentInput = event.target.className;

                                        if (checkbox.is(':checked')) {
                                            checkbox.attr('value', true)
                                        } else {
                                            checkbox.attr('value', false)
                                        }
                                        uniqueArray.forEach((obj) => {
                                            if (obj.name === key) {
                                                obj[currentInput] = checkbox[0].value
                                            }
                                        })

                                        parameters.forEach((obj) => {
                                            if (obj.name === key) {
                                                obj.inInformation = checkbox[0].value
                                            }
                                        })

                                        Array.from(matLabel).forEach((item) => {
                                            if (removeSpaces(item.innerHTML).includes('parameterslist')) {
                                                let inputParamList = item.closest('div').firstChild

                                                inputParamList.value = JSON.stringify(parameters)
                                                inputParamList.dispatchEvent(inputEvent)
                                            }
                                        })

                                        inputOriginal.value = JSON.stringify(uniqueArray) // вставка массива в нативный инпут
                                        inputOriginal.dispatchEvent(inputEvent)
                                    })

                                }
                            }

                            // вставка кнопки удаления
                            $(`.container_for_${className} div:nth-child(${ii + 1})`).append(`
                           <button class="deleteBtn" data-id="${array[ii].name.replace(/\s+/g, '')}">&nbsp;&nbsp;</button> `)
                        }
                    }
                }
            }

            // код удаления
            $(`.container_${className} .deleteBtn`).click((event) => {
                const elementID = event.target.dataset.id.replace(/\s+/g, '')

                Array.from($(`.container_${className} > div > div`)).forEach(div => {
                    if (div.querySelector('.deleteBtn').dataset.id.replace(/\s+/g, '') === elementID) {
                        div.remove()
                    }
                })

                for (let i = 0; i < uniqueArray.length; i++) {
                    if (uniqueArray[i].name.replace(/\s+/g, '') === elementID) {
                        uniqueArray.splice(i, 1)

                        inputOriginal.value = JSON.stringify(uniqueArray)
                        inputOriginal.dispatchEvent(inputEvent)
                    }
                }
            })

            $(`.event_select_${className}`).on('change', (e) => {
                let valueSelected = $(`.event_select_${className}`).val()
                let selectedParam = {}
                let divWithParams = document.createElement('div')

                if (valueSelected && valueSelected !== '+') {
                    // выбранный option удалить
                    let options = $(`.event_select_${className} option`)

                    for (let i = 0; i < options.length; i++) {
                        if (options[i].value === valueSelected && keyName === 'Расчет ОЕЕ') {
                            $(options[i]).remove()
                        } else if (options[i].value === valueSelected && keyName !== 'Расчет ОЕЕ') {

                            $(options[i]).remove()
                            selectedParam.name = valueSelected
                        }
                    }

                    for (let i = 0; i < quantityInputs; i++) {
                        let input = document.createElement('input')
                        input.className = `input-${i + 1}`

                        if (keyName === 'Определение Рецепта') {
                            switch (i) {
                                case 0:
                                    input.placeholder = 'Адрес в контроллере'
                                    break;
                                case 1:
                                    input.placeholder = 'PP по рецепту'
                                    break;
                                case 2:
                                    input.placeholder = 'Обозначение рецепта'
                                    break;
                            }
                        }

                        if (keyName === 'Набор технологических  параметров' && i === quantityInputs - 1) {
                            input.setAttribute('type', 'checkbox')
                            input.className = `inInformation`
                        }

                        input.addEventListener('change', (e) => {
                            if (keyName === 'Расчет ОЕЕ') {
                                selectedParam[`${valueSelected.includes('Q') ?
                                    'Q_plan' : valueSelected.includes('DP') ?
                                        'DP' : valueSelected === 'PP - Плановая производств' ?
                                            'PP' : valueSelected === 'PPT - Общее доступное время, мин' ?
                                                'PPT' : valueSelected === 'P - Плановое значение производительности' ?
                                                    'P_plan' : valueSelected.includes('A') ?
                                                        'A_plan' : valueSelected.includes('OEE') ?
                                                            'OEE_plan' : valueSelected === 'GP - Выпуск качественной продукции' ?
                                                                'GP' : ''
                                }`] = e.target.value

                            } else if (keyName === 'Набор технологических  параметров' && i === quantityInputs - 1) {
                                if ($(input).is(':checked')) {
                                    $(input).attr('value', true)
                                } else {
                                    $(input).attr('value', false)
                                }

                                selectedParam[`inInformation`] = e.target.value == false ? '' : e.target.value

                                parameters.forEach((obj) => {
                                    if (obj.name === e.target.parentElement.firstChild.innerHTML) {
                                        obj.inInformation = e.target.value
                                    }
                                })

                                Array.from(matLabel).forEach((item) => {
                                    if (removeSpaces(item.innerHTML).includes('parameterslist')) {
                                        let inputParamList = item.closest('div').firstChild

                                        inputParamList.value = JSON.stringify(parameters)
                                        inputParamList.dispatchEvent(inputEvent)
                                    }
                                })

                            } else {
                                selectedParam[`input-${i + 1}`] = e.target.value
                            }

                            if (keyName === 'Набор технологических  параметров' && !selectedParam.inInformation) {
                                selectedParam[`inInformation`] = ''
                            }
                            arrayWithSelectedParams.push(selectedParam)

                            // удаляем одинаковые объекты
                            uniqueArray = arrayWithSelectedParams.filter((item, pos) => {
                                return arrayWithSelectedParams.indexOf(item) == pos;
                            })

                            if (keyName === 'Расчет ОЕЕ') {
                                let objWithParams = {}
                                uniqueArray.forEach((key) => {
                                    for (let i in key) {
                                        objWithParams[i] = key[i]
                                    }
                                })
                                inputOriginal.value = JSON.stringify(objWithParams) // вставка в нативный инпут
                            } else {
                                inputOriginal.value = JSON.stringify(uniqueArray) // вставка массива в инпут
                            }

                            if (keyName === 'Определение Рецепта') {
                                fetch(`http://${window.location.hostname}:1803/getAllProductList`)
                                    .then(response => response.json())
                                    .then(recipes => {
                                        Array.from(matLabel).forEach((item) => {
                                            if (removeSpaces(item.innerHTML).includes('productlist')) {
                                                let inputOriginal = item.closest('div').firstChild

                                                for (let v = 0; v < recipes.length; v++) {
                                                    if (recipes[v].name === e.target.parentElement.firstChild.innerHTML) {
                                                        switch (e.target.className) {
                                                            case 'input-1':
                                                                recipes[v].address = e.target.value
                                                                break;
                                                            case 'input-2':
                                                                recipes[v].PP = e.target.value
                                                                break;
                                                            case 'input-3':
                                                                recipes[v].value = e.target.value
                                                                break;
                                                        }
                                                    }

                                                    Array.from(e.target.closest(`.container_for_recipes`).querySelectorAll('span')).forEach((span) => {
                                                        let checkArray = products.map((p) => p.name)

                                                        if (recipes[v].name === span.innerHTML && !checkArray.includes(span.innerHTML)) {
                                                            products.push(recipes[v])
                                                        } else if (recipes[v].name === span.innerHTML && products.length !== 0) {
                                                            products.forEach((i, ind) => {
                                                                if (i.name === e.target.parentElement.firstChild.innerHTML) {
                                                                    switch (e.target.className) {
                                                                        case 'input-1':
                                                                            i.address = e.target.value
                                                                            break;
                                                                        case 'input-2':
                                                                            i.PP = e.target.value
                                                                            break;
                                                                        case 'input-3':
                                                                            i.value = e.target.value
                                                                            break;
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    })
                                                }

                                                inputOriginal.value = JSON.stringify(products) // вставка в инпут
                                                inputOriginal.dispatchEvent(inputEvent)
                                            }
                                        })
                                    })
                            }

                            if (keyName === 'Набор технологических  параметров') {
                                fetch(`http://${window.location.hostname}:1803/getAllParametersList`)
                                    .then(response => response.json())
                                    .then(recipes => {
                                        Array.from(matLabel).forEach((item) => {
                                            if (removeSpaces(item.innerHTML).includes('parameterslist')) {
                                                let inputOriginal = item.closest('div').firstChild

                                                recipes.forEach((recip, index) => {
                                                    if (recip.name === e.target.previousElementSibling.innerHTML) {
                                                        recip.address = e.target.value
                                                    }
                                                    Array.from(e.target.closest(`.container_for_params`).querySelectorAll('span')).forEach((span) => {
                                                        let checkArray = parameters.map((p) => p.name)

                                                        if (recip.name === span.innerHTML && !checkArray.includes(span.innerHTML)) {
                                                            parameters.push(recip)
                                                        } else if (recip.name === span.innerHTML && parameters.length !== 0) {
                                                            parameters.forEach((i, ind) => {
                                                                if (i.name === e.target.previousElementSibling.innerHTML) {
                                                                    i.address = e.target.value
                                                                }
                                                            })
                                                        }
                                                    })
                                                })
                                                inputOriginal.value = JSON.stringify(parameters) // вставка в инпут
                                                inputOriginal.dispatchEvent(inputEvent)
                                            }
                                        })
                                    })
                            }

                            inputOriginal.dispatchEvent(inputEvent)
                        })

                        divWithParams.append(input)
                    }

                    let span = document.createElement('span')
                    span.innerHTML = valueSelected

                    divWithParams.prepend(span)
                    $(`.container_for_${className}`).append(divWithParams)
                    matLabel[label].closest('div').firstChild.focus()

                    $(`.container_for_${className} input`).css({
                        'height': '36px',
                        'width': '45%',
                        'margin': '0px 5px',
                        'border': '1px solid #cacaca',
                        'border-radius': '5px',
                        'padding-left': '5px'
                    })
                    $(`.container_for_${className} input[type="checkbox"]`).css({
                        'width': '19px',
                    })
                    $(`.container_for_${className} div`).css({
                        'display': 'flex',
                        'width': '100%',
                        'margin-bottom': '6px'
                    })
                    $(`.container_for_${className} div span`).css({
                        'width': '300px',
                        'display': 'flex',
                        'align-items': 'center',
                    })
                }
            })

            $(parentNode[label]).after(`<details id="details_${className}" close><summary>${keyName}</summary></details>`)
            $(parentNode[label]).prependTo(`#details_${className}`)
        }
    }
    // inputs styles

    $(`.container_${className}`).css({
        'position': 'relative',
        'width': '100%',
    })
    $(`.container_for_${className} input`).css({
        'height': '36px',
        'width': '45%',
        'margin': '0px 5px',
        'border': '1px solid #cacaca',
        'border-radius': '5px',
        'padding-left': '5px',
        'transition': 'border 200ms',
    })
    if (className !== 'configuration') {
        $(`.container_for_${className} div`).css({
            'display': 'flex',
            'width': '100%',
            'margin-bottom': '6px'
        })
        $(`#details_${className}`).css({'width': '100%', 'margin-bottom': '14px'})
    }

    $(`.container_for_${className} div span`).css({
        'width': '300px',
        'display': 'flex',
        'align-items': 'center',
    })
    $(`.event_select_${className}`).css({
        'margin-top': '10px',
    })
    $(`.boxForDelete_${className}`).css({
        'position': 'absolute',
        'display': 'flex',
        'flex-direction': 'column',
        'right': '-20px',
        'top': '0',
        'height': '108px',
    })
    $(`.boxForDelete_${className} span`).css({
        'text-align': 'center',
        'margin-right': '3px',
        'margin-top': '21px',
        'border': '1px solid gray',
        'width': '21px',
        'border-radius': '50%',
        'padding-top': '1px',
    })
    $(`.boxForDelete_${className} span:hover`).css({"background-color": "#eee"})
    $(`.boxForDelete_${className} span`).hover(function () {
        $(this).css({"background-color": "#eee"})
    }, function () {
        $(this).css({"background-color": "#fff"})
    });
    $(`.boxForDelete_${className} span:first-child`).css({'margin-top': '7px',})
    $(`#details_${className} summary`).css({
        'margin-bottom': '10px'
    })
    $(`.container_for_${className} input[type="checkbox"]`).css({
        'width': '19px',
    })

    disableInputs()

}

function drawSelect(keyName, className, arrayWihtSections) {
    let matLabel = $('.layout-wrap.vertical-alignment mat-label')
    let $injector = self.ctx.$scope.$injector;
    let assetService = $injector.get(self.ctx.servicesMap.get('assetService'));

    for (let label = 0; label < matLabel.length; label++) {
        if (removeSpaces(matLabel[label].innerHTML).includes(removeSpaces(keyName))) {
            let inputOriginal = matLabel[label].closest('div').firstChild
            let container = document.createElement('div');
            container.className = `container_${className}`

            let select = document.createElement('select');
            select.classList.add(`event_select_${className}`)

            let span = document.createElement('span');
            span.classList.add(`event_span_${className}`)
            span.innerHTML = keyName

            arrayWihtSections.forEach(section => {
                select.innerHTML += `<option>${section}</option>`
            })
            container.append(span, select) // add label

            matLabel[label].closest('mat-form-field').append(container)
            // скрыть нативный инпут
            matLabel[label].offsetParent.offsetParent.offsetParent.offsetParent.parentNode.firstChild.style.display = 'none';

            // подгрузка и отрисовка
            for (let i = 0; i < self.ctx.data.length; i++) {
                if (removeSpaces(self.ctx.data[i].dataKey.label) === removeSpaces(keyName)) {
                    let array
                    try {
                        array = JSON.parse(self.ctx.data[i].data[0][1])
                    } catch (e) {
                    }

                    for (let key in array) {
                        const options = $(`.event_select_${className} option`)

                        for (let j = 0; j < options.length; j++) {
                            if (options[j].value === array[key]) {
                                options[j].selected = true
                            }
                        }
                    }

                    if (keyName === 'Принадлежность к линии') {
                        const lineInput = document.createElement('input')
                        const line = $(`.event_select_${className}`).val()
                        lineInput.classList.add(`lineInput_${className}`)
                        lineInput.type = "number";
                        lineInput.min = 1
                        lineInput.max = 100
                        lineInput.step = 1

                        container.append(lineInput)
                        const deviceName = getDeviceName()
                        const deviceId = self.ctx.datasources[0].entityId

                        ctx.attributeService.getEntityAttributes(
                            {id: deviceId, entityType: 'DEVICE'},
                            'SERVER_SCOPE',
                            ['shiftPositionInRelation']).subscribe(response => {
                            lineInput.value = response[0].value
                        })

                        $(`.lineInput_${className}`).on('change', (e) => {
                            const value = $(`.lineInput_${className}`).val()

                            if (value) {
                                Array.from(matLabel).forEach((item) => {
                                    if (item.innerHTML.replace(/\s+/g, '').includes('shiftPositionInRelation')) {
                                        const inputOriginal = item.closest('div').firstChild
                                        inputOriginal.value = value
                                        inputOriginal.dispatchEvent(inputEvent)
                                    }
                                })
                            }
                        })

                    }

                    if (keyName === 'Тип') {
                        Array.from(matLabel).forEach((item) => {
                            if (item.innerHTML.replace(/\s+/g, '').includes('Тип')) {
                                setTimeout(() => {
                                    let inputOriginal = item.closest('div').firstChild
                                    let val = inputOriginal.value === 'plain' ? 'Простой' : inputOriginal.value === 'work' ? 'Работа' : ''
                                    Array.from($(`.event_select_${className} option`)).forEach((opt) => {
                                        if (opt.innerHTML === val)
                                            $(opt).prop('selected', true)
                                    })
                                }, 0);
                            }
                        })
                    }
                }
            }

            $(`.event_select_${className}`).on('change', (e) => {
                let valueSelected = $(`.event_select_${className}`).val()
                let selectedParam = {}
                switch (keyName) {
                    case 'Принадлежность к цеху':
                        selectedParam[`workshop`] = e.target.value
                        break;
                    case 'Принадлежность к линии':
                        selectedParam[`section`] = e.target.value

                        let dropDown = document.createElement('select');
                        dropDown.classList.add(`dropDown_${className}`)

                        $(`.dropDown_${className}`).empty()

                        assetService.findByName(valueSelected).subscribe((response) => {
                            fetch(`http://${window.location.hostname}:1803/getPossibleIndexInEntity?entityID=${response.id.id}`)
                                .then(response => response.json())
                                .then(indexes => {
                                    indexes.unshift('')
                                    indexes.forEach(index => {
                                        document.querySelector(`.dropDown_${className}`).innerHTML += `<option data-index="${index}">${index}</option>`
                                    })
                                    $(`.dropDown_${className}`).on('change', (e) => {
                                        let valueSelected = $(`.dropDown_${className}`).val()
                                        if (valueSelected !== '') {
                                            Array.from(matLabel).forEach((item) => {
                                                if (item.innerHTML.replace(/\s+/g, '').includes('shiftPositionInRelation')) {
                                                    let inputOriginal = item.closest('div').firstChild
                                                    inputOriginal.value = valueSelected
                                                    inputOriginal.dispatchEvent(inputEvent)
                                                }
                                            })
                                        }
                                    })
                                })
                        })

                        break;
                    case 'Принадлежность к производству':
                        selectedParam[`factory`] = e.target.value
                        break;
                    case 'Тип':
                        selectedParam = e.target.value === 'Работа' ? 'work' : e.target.value === 'Простой' ? 'plain' : ''
                        inputOriginal.value = selectedParam
                        inputOriginal.dispatchEvent(inputEvent)
                        break;
                }
                if (valueSelected && valueSelected !== '+' && keyName !== 'Тип') {
                    inputOriginal.value = JSON.stringify(selectedParam) // вставка объекта в нативный инпут
                    inputOriginal.dispatchEvent(inputEvent)
                }

                assetService.findByName(valueSelected).subscribe((response) => { // находим актив по названию
                    $('#submit').click(() => {
                        $('button[type="submit"].mat-primary').click(() => {
                            let xhr = new XMLHttpRequest()
                            switch (keyName) {
                                case 'Принадлежность к цеху':
                                    xhr.open('GET', `http://${window.location.hostname}:1803/assignEntity?from=${response.id.id}&typeFrom=asset&to=${self.ctx.datasources[0].entityId}&typeTo=asset`, true)
                                    xhr.send()
                                    break;
                                case 'Принадлежность к линии':
                                    xhr.open('GET', `http://${window.location.hostname}:1803/assignEntity?from=${response.id.id}&typeFrom=asset&to=${self.ctx.datasources[0].entityId}&typeTo=device`, true)
                                    xhr.send()
                                    break;
                                case 'Принадлежность к производству':
                                    xhr.open('GET', `http://${window.location.hostname}:1803/assignEntity?from=${response.id.id}&typeFrom=asset&to=${self.ctx.datasources[0].entityId}&typeTo=asset`, true)
                                    xhr.send()
                                    break;
                            }
                        })
                    })
                })
            })

            $(`.event_select_${className}`).css({
                'width': '300px',
                'height': '36px',
                'border': '1px solid #cacaca',
                'border-radius': '5px',
            })
            $(`.container_${className}`).css({'display': 'flex', 'flex-direction': 'column'})
            $(`.event_span_${className}`).css({'font-size': '0.9em', 'margin-bottom': '5px', 'color': '#8e8e8e'})

        }
    }

    function getDeviceName() {
        let deviceName
        Array.from(matLabel).forEach(label => {
            if (label.textContent === 'Наименование') {
                deviceName = label.closest('div').firstChild.value
            }
        })
        return deviceName
    }

    disableInputs()
}

// оборачивает input в аккордеон
function wrapToAccordeon(keyName, className, label) {
    let matLabel = $('.layout-wrap.vertical-alignment mat-label')
    let parentNode
    let key = removeSpaces(keyName)
    if ($('.layout-wrap.vertical-alignment')[0])
        parentNode = $('.layout-wrap.vertical-alignment')[0].childNodes

    for (let i = 0; i < matLabel.length; i++) {
        if (removeSpaces(matLabel[i].innerHTML).includes(key)) {
            $(parentNode[i]).before(`<details id="details_links" close><summary>${label}</summary></details>`)

            for (let ii = 0; ii < parentNode.length - 1; ii++) {
                if (typeof parentNode[ii] == 'string')
                    continue;

                if (parentNode[ii].querySelector("mat-label")) {
                    let item = removeSpaces(parentNode[ii].querySelector("mat-label").innerHTML)
                    if (item.includes(key)) {
                        $(parentNode[ii]).appendTo(`#details_${className}`)
                    }
                }
            }
        }
    }
}

function disabledInput(keyName, inputValue) {
    let matLabel = $('.layout-wrap.vertical-alignment mat-label')
    Array.from(matLabel).forEach((label) => {
        if (label.innerHTML === keyName) {
            // label.offsetParent.offsetParent.offsetParent.offsetParent.parentNode.firstChild.style.display = 'none';
            let inputOriginal = label.closest('div').firstChild
            if (inputOriginal.value === inputValue) {
                inputOriginal.disabled = true
            }

        }
    })
}

self.onInit = function () {
    let activeID = self.ctx.data[0].datasource.entityId
    let tenantId = self.ctx.dashboard.authUser.tenantId
    let entityType = self.ctx.data[0].datasource.entityType
    let $injector = self.ctx.$scope.$injector
    let assetService = $injector.get(self.ctx.servicesMap.get('assetService'))
    let deviceService = $injector.get(self.ctx.servicesMap.get('deviceService'))

    let asset = {
        additionalInfo: null,
        createdTime: null, // временно
        customerId: {
            entityType: "CUSTOMER",
            id: self.ctx.dashboard.authUser.customerId
        },
        id: {
            entityType: entityType,
            id: activeID
        },
        label: null,
        name: '',
        tenantId: {
            entityType: "TENANT",
            id: tenantId
        },
        type: ''
    }

    self.ctx.$scope.role = currentUser.role

    jscolor.init()
    ii = '';
    color = ''
    for (let i = 0; i < self.ctx.data.length; i++) {
        if (self.ctx.data[i].dataKey.name === 'color') {
            color = self.ctx.data[i].data[0][1]
        }
    }

    let matLabel = $('.layout-wrap.vertical-alignment mat-label')
    let parentNode
    if (typeof $('.layout-wrap.vertical-alignment')[0] != 'undefined')
        parentNode = $('.layout-wrap.vertical-alignment')[0].childNodes

    function hideInput(keyName) {
        Array.from(matLabel).forEach((label) => {
            if (label.innerHTML === keyName) {
                label.offsetParent.offsetParent.offsetParent.offsetParent.parentNode.firstChild.style.display = 'none';
            }
        })
    }

    hideInput('productList')
    hideInput('parametersList')
    hideInput('visibleAttributes')
    hideInput('shiftPositionInRelation')
    hideInput('Набор состояний*')

    drawInputs('Набор событий', 'events', ['+', 'событие 1', 'событие 2', 'событие 3'], 3)

    if (self.ctx.datasources[0].entityType === 'DEVICE') {
        drawInputs('Расчет ОЕЕ', 'configuration', [
            '',
            'Q - Плановое значение качества',
            'P - Плановое значение производительности',
            'A - Плановое значение достуности',
            'OEE - Плановое значение ОЕЕ',
            'PPT - Общее доступное время, мин',
            'PP - Плановая производительность',
            'DP - Выпуск не годной продукции',
            'GP -  Выпуск качественной продукции'
        ], 1)
    } else {
        drawInputs('Расчет ОЕЕ', 'configuration', ['', 'Q - Плановое значение качества', 'P - Плановое значение производительности', 'A - Плановое значение достуности', 'OEE - Плановое значение ОЕЕ'], 1)
    }

    wrapToAccordeon('Адрес коммуникационного контроллера', 'links', 'Параметры связи')

    drawSelect('Тип', 'type', ['Работа', 'Простой'])

    fetch(`http://${window.location.hostname}:1803/getList?type=section`)
        .then(response => response.json())
        .then(sections => {
            drawSelect('Принадлежность к линии', 'belonging', sections.arr)
        })

    fetch(`http://${window.location.hostname}:1803/getList?type=workshop`)
        .then(response => response.json())
        .then(workshop => {
            drawSelect('Принадлежность к цеху', 'belongingWorkshop', workshop.arr)
        })

    fetch(`http://${window.location.hostname}:1803/getList?type=factory`)
        .then(response => response.json())
        .then(factory => {
            drawSelect('Принадлежность к производству', 'belongingFactory', factory.arr)
        })

    // fetch(`http://${window.location.hostname}:1803/getAllProductList`)
    //     .then(response => response.json())
    //     .then(recipes => {
    //         let arrayRecipes = recipes.map(item => item.name)
    //         arrayRecipes.unshift('+')

    //         // drawInputs('Определение Рецепта', 'recipes', arrayRecipes, 3)
    //     })

    fetch(`http://${window.location.hostname}:1803/getAllParametersList`)
        .then(response => response.json())
        .then(params => {
            let arrayParams = params.map(item => item.name)
            arrayParams.unshift('+')
            drawInputs('Набор технологических  параметров', 'params', arrayParams, 2)
        })

    for (let i = 0; i < matLabel.length; i++) {
        // вставка колор пикера
        if (matLabel[i].innerHTML.toLowerCase().includes('цвет')) {
            ii = i
            let div = document.createElement('div');
            div.className = "color_picker_div";

            let input = document.createElement('input');
            input.setAttribute('data-jscolor', `{preset:'large dark', value: '${color}' }`);
            input.setAttribute('mat-input', '');
            let p = document.createElement('p');
            p.className = "color_picker_p";
            p.innerHTML = 'Цвет:'

            div.append(p, input)

            matLabel[i].offsetParent.offsetParent.offsetParent.offsetParent.parentNode.append(div)
            // скрыть нативный инпут
            matLabel[i].offsetParent.offsetParent.offsetParent.offsetParent.parentNode.firstChild.style.visibility = 'hidden';

            jscolor.init()

            $('.jscolor').click(() => {
                const jsColorPicker = $('.jscolor-picker-wrap');
                let top = jsColorPicker[0].getBoundingClientRect().top + 181
                let left = jsColorPicker[0].getBoundingClientRect().left
                let inputTB = matLabel[i].closest('div').firstChild

                if ($('.paletteColor').length === 0) {
                    $(document.body).append(`
                        <div class="paletteColor">
                            <div class="colors">
                                <div data-color="40c7cd" style="background-color:#40c7cd;"></div>
                                <div data-color="358d36" style="background-color:#358d36;"></div>
                                <div data-color="72a6ce" style="background-color:#72a6ce;"></div>
                                <div data-color="3c8cc7" style="background-color:#3c8cc7;"></div>
                                <div data-color="43434d" style="background-color:#43434d;"></div>
                                <div data-color="91775e" style="background-color:#91775e;"></div>
                                <div data-color="ffd22f" style="background-color:#ffd22f;"></div>
                                <div data-color="dcac01" style="background-color:#dcac01;"></div>
                                <div data-color="c06772" style="background-color:#c06772;"></div>
                                <div data-color="be001c" style="background-color:#be001c;"></div>
                            </div>
                        </div>
                `)

                    $('.paletteColor').css({
                        'width': '336px',
                        'height': '34px',
                        'position': 'fixed',
                        'z-index': '10000',
                        'background-color': '#eee',
                        'border-radius': '0 0 5px 5px'
                    })
                    $('.paletteColor .colors div').css({
                        'width': '30px',
                        'height': '30px',
                        'border-radius': '5px',
                        'display': 'inline-block',
                        'cursor': 'pointer',
                    })

                    $('.paletteColor .colors div').mousedown((event) => {
                        let color = event.target.attributes["data-color"].value
                        document.querySelector('.jscolor').jscolor.fromString(color)
                        inputTB.value = `#${color}`
                        inputTB.dispatchEvent(inputEvent);
                    })
                }

                $('.paletteColor').css({'top': top, 'display': 'block', 'left': left})

                setInterval(() => {
                    if (!$('.color_picker_div input').is(':focus')) {
                        $(".paletteColor").remove()
                    }
                }, 500);

            })
        }
    }

    $(`input[data-jscolor]`).change(() => {
        let input = matLabel[ii].parentElement.parentElement.parentElement.firstChild;
        input.value = $(`input[data-jscolor]`).val()
        input.dispatchEvent(inputEvent)
    });

    let accessClick = true;

    $('form').click((event) => {
        if (event.target.innerText.toLowerCase() === 'сохранить' && accessClick && event.target.parentNode.disabled !== true) {
            event.preventDefault()
            if (asset.id.entityType === 'DEVICE')
                saveVisibleAttributes()
            $('.modal').fadeIn(200)
            $('.blur').fadeIn(200)
            $('.modal p').html(`Вы действительно хотите произвести изменение?`)
            accessClick = false;

            $('button[type="submit"].mat-primary').prop('disabled', true)

            $('#submit').click(() => {
                $('.modal').removeClass("show")
                const submitButton = $('button[type="submit"].mat-primary');
                submitButton.prop('disabled', false)
                submitButton.click()
                accessClick = true

                const matLabels = $('mat-label');
                for (let i = 0; i < matLabels.length; i++) {
                    if (matLabels[i].innerHTML.toLowerCase().includes('наименование')) {
                        asset.name = matLabels[i].offsetParent.offsetParent.offsetParent.firstElementChild.value
                    }
                }
                asset.type = localStorage.getItem('aliasName')

                if (asset.id.entityType === 'ASSET') {
                    assetService.saveAsset(asset).subscribe(() => {
                        self.ctx.updateAliases();
                        if (asset.type === 'Parameter')
                            fetch(`http://${window.location.hostname}:1803/updateParamsRelationsInMachines?id=${asset.id.id}&type${asset.type}`)
                    })
                } else if (asset.id.entityType === 'DEVICE') {

                    deviceService.saveDevice(asset).subscribe(() => {
                        self.ctx.updateAliases();
                        fetch(`http://${window.location.hostname}:1803/updateMachineConfiguration?id=${asset.id.id}`)
                    })
                }
            })
        }
    })

    // запрет нажатие на enter
    $('input').keydown((event) => {
        if (event.keyCode === 13) {
            event.preventDefault()
        }
    });

    $('#cancel').click(() => {
        $('.modal').hide(100)
        $('.blur').hide(100)
        accessClick = true;
        $('button[type="submit"].mat-primary').prop('disabled', false)
    })
        
    // end onInit
}

function saveVisibleAttributes() {
    let parametersList = []
    let originalVisibleAttributes = []
    let indexOfVA
    let matLabel = $('.layout-wrap.vertical-alignment mat-label')

    for (let label = 0; label < matLabel.length; label++) {
        if (removeSpaces(matLabel[label].innerHTML).includes('parameterslist')) {
            try {
                parametersList = JSON.parse(matLabel[label].closest('div').firstChild.value)
            } catch (e) {
            }
        }
        if (removeSpaces(matLabel[label].innerHTML).includes('visibleattributes')) {
            indexOfVA = label
            try {
                originalVisibleAttributes = JSON.parse(matLabel[label].closest('div').firstChild.value)
            } catch (e) {
            }
        }
    }
    let newVisibleAttributes = []
    for (let i in originalVisibleAttributes) {
        if (originalVisibleAttributes[i].type !== 'parameters')
            newVisibleAttributes.push(originalVisibleAttributes[i])
    }
    for (let i in parametersList) {
        parametersList[i].type = 'parameters'
        newVisibleAttributes.push(parametersList[i])
    }

    matLabel[indexOfVA].closest('div').firstChild.value = JSON.stringify(newVisibleAttributes)
    matLabel[indexOfVA].closest('div').firstChild.dispatchEvent(inputEvent)
}

self.onDataUpdated = function () {
    self.ctx.$scope.multipleInputWidget.onDataUpdated();
    if (currentUser.role !== 'administrator' && currentUser.role !== 'engineer') {

        $('.mat-input-element ').prop('disabled', true)
        $('.jscolor ').prop('disabled', true)

        const buttons = $('button')
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].innerText.toLowerCase() === 'откатить' ||
                buttons[i].innerText.toLowerCase() === 'сохранить') {
                buttons[i].style.display = 'none'
            }
        }
    }
    if (currentUser.role === 'administrator' || currentUser.role === 'engineer') {
        $('.btn').css({'display': 'block'})
    }

    disabledInput('Наименование состояния', 'Простой')
    disabledInput('Наименование состояния', 'Работа')

    disableInputs()

    const buttons = [...$('button')]
    const inputsValues = {}
    const inputs = [
        ...self.ctx.$container[0].querySelector('form').querySelectorAll('input'),
        ...self.ctx.$container[0].querySelector('form').querySelectorAll('select'),
    ]

    inputs.forEach((item, index) => {
        inputsValues[index] = item.value
    })

    buttons.forEach(btn => {
        if (btn.innerText === 'Откатить') {
            btn.addEventListener('click', event => {
                inputs.forEach((input, index) => {
                    input.value = inputsValues[index]
                })
            })
        }
    })

}

function disableInputs() {
    const inputs = [
        ...self.ctx.$container[0].querySelector('form').querySelectorAll('input'),
        ...self.ctx.$container[0].querySelector('form').querySelectorAll('select'),
    ]

    inputs.forEach(input => { input.disabled = true })
    $('.deleteBtn').prop('disabled', true)

    self.ctx.$scope.toggleChanged = (event) => {
        if (event.checked) {
            inputs.forEach(input => input.disabled = false)
            $('.deleteBtn').prop('disabled', false)
        } else {
            inputs.forEach(input => input.disabled = true)
            $('.deleteBtn').prop('disabled', true)
        }
    }
}

function getDataOf(keyName) {
    let keyData = []
    self.ctx.data.forEach((data) => {
        if (data.dataKey.name === keyName) {
            try {
                keyData = JSON.parse(data.data[0][1])
            } catch (e) {
                console.log(e)
            }
        }
    })
    return keyData
}

function removeSpaces(string) {
    return string.toLowerCase().replace(/\s+/g, '')
}
