let structure = {}

function mainHeadMenuButtonClicked() {
    const burgerMenu = $('#burgerMenu')

    if (burgerMenu[0].style.display !== "none") {
        burgerMenu.hide(200)
    } else {
        burgerMenu.show(200)
        burgerMenu.mouseleave(() => {
            setTimeout(() => {
                if ($('.accordeon:hover').length == 0) {
                    burgerMenu.hide(200)
                    $('#checkbox3').prop('checked', false);
                }
            }, 500);
        })
    }
}

function getEntityMap() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://' + window.location.hostname + ':1880/mainMenu', true);
    xhr.send();
    xhr.onload = getAnswer;

    function getAnswer() {
        let answer = []
        try {
            answer = JSON.parse(xhr.responseText)
        } catch (e) {
        }
        structure = answer
        entityHierarchy = answer
        drawBurgerMap(answer)
    }

    function drawBurgerMap(entityList) {
        let html = '<ul class="accordeon">'
        //Создаём цеха
        for (let ws = 0; ws < entityList.length; ws++) {

            html += `
                <li><a class="workshopsList" href="javascript:void(0);">
                        <i class="fa fa-angle-down fa-lg"></i>
                    </a>
                    <span>
                        <a class="workshopsList" 
                            stateName="workshop" 
                            entityId=${entityList[ws].id} 
                            entityType=${entityList[ws].entity_type}>${entityList[ws].name}</a>
                    </span>`

            if (entityList[ws].childs && !entityList[ws].childs.error && entityList[ws].childs.length > 0) {

                //Линия есть, тоже пушим
                html += `<ul class="lineLevel">`
                let sections = entityList[ws].childs
                for (let s = 0; s < sections.length; s++) {
                    html += `
    	              <li>
        	             <a href="#">
        	               <i class="fa fa-angle-down fa-lg  lineLevel"></i>
        	             </a>
        	             <span>
        	               <a  stateName="section" entityId=${sections[s].id} entityType=${sections[s].entity_type}>${sections[s].name}</a>
        	             </span>`

                    if (sections[s].childs && !sections[s].childs.error && sections[s].childs.length > 0) {

                        //И оборудование есть, пушим финалочку
                        html += `<ul>`
                        for (let m = 0; m < sections[s].childs.length; m++) {
                            let machine = sections[s].childs[m]
                            html += `
                                <li class="machineLevel">
                                  <span>
                                    <a stateName="machine" 
                                       entityId=${machine.id}
                                       entityType=${machine.entity_type}
                                       entityName=${machine.name.replace(/\s+/g, '')}>${machine.name}</a>
                                  </span>
                                </li>`
                        }
                        //Закрываем станкИ
                        html += `</ul>`
                    }
                    //Закрываем линиЮ
                    html += '</li>'
                }
                //Закрываем линиИ
                html += '</ul>'
            }
            //Закрываем цеха
            html += '</li>'
        }

        //Закрываем accordeon
        html += '</ul>'

        $('#burgerMenu').html(html)
        horizontalNavigation()
    }
}

function initialize() {
    mainHeadMenuButtonClicked()
    $(document).undelegate("#paginatorNext, #paginatorPrev", 'click')
    $(document).undelegate(".accordeon > li > a, .lineLevel > li > a , .dropdownMenuList >li>a", 'click')
    $(document).undelegate("[entityid]", 'click')
    let gridsters = $('gridster-item')
    for (let i = 0; i < gridsters.length; i++) {
        if (gridsters[i].textContent.indexOf('mainMenu') !== -1)
            continue;
        gridsters[i].style['z-index'] = 0
    }
}

let oldTime = null
let isChanged = true

function syncingDates() {

    $(document).click(event => {
        const target = event.target
        if (target.nodeName === 'CANVAS') {
            self.ctx.interval.clearAll()
            // убираем блок с календаря, disable чекбокс, очистить localStorage
            $('#toggleForCalendar select').attr('disabled', 'disabled')
            $('.opacity_box').css({'display': 'none'})
            localStorage.removeItem('selectedRealTime')
        }

        if (target.className === 'horizontalNavigation' && target.nodeName === 'A') {
            self.ctx.interval.clearAll()
        }
    })

    const dateFromStorage = JSON.parse(sessionStorage.getItem('selectedDate'))

    if (dateFromStorage) {
        // забить время в ТВ если оно есть в storage
        ctx.timewindowFunctions.onUpdateTimewindow(dateFromStorage.from, dateFromStorage.to)
    }

    let currentTimeInTB = ''

    setInterval(() => {
        if (self.ctx && self.ctx.dashboardTimewindow.history) {
            currentTimeInTB = updateCurrentTime()
        }
    }, 1000)

    // каждую секуду проверяем изменилась ли переменная
    setInterval(() => {
        const dashboardTime = self.ctx.dashboardTimewindow
        if (currentTimeInTB !== oldTime) {
            if (self.ctx && dashboardTime.history) {
                const from = new Date(dashboardTime.history.fixedTimewindow.startTimeMs)
                const to = new Date(dashboardTime.history.fixedTimewindow.endTimeMs)
                setDateToDatePicker(from, to)
            }
            oldTime = currentTimeInTB;
            isChanged = true
        }

        if (self.ctx && dashboardTime.realtime && isChanged) {
            const timeShift = dashboardTime.realtime.timewindowMs
            const from = new Date(Date.now() - timeShift)
            const to = new Date(Date.now())

            setDateToDatePicker(from, to)
            isChanged = false
        }
    }, 1000)
}

function updateCurrentTime() {
    return self.ctx.dashboardTimewindow.history.fixedTimewindow.startTimeMs +
        self.ctx.dashboardTimewindow.history.fixedTimewindow.endTimeMs
}

function setDateToDatePicker(from, to) {
    try {
        $('input[name="daterange"]').data('daterangepicker').setStartDate(from)
        $('input[name="daterange"]').data('daterangepicker').setEndDate(to)
        $('i[name="daterange"]').data('daterangepicker').setStartDate(from)
        $('i[name="daterange"]').data('daterangepicker').setEndDate(to)
    } catch (e) {
    }
}

function jqueryActions() {
    $(function () {
        function getNowFromToTime() {
            let timeFrom
            let timeTo
            if (self.ctx && self.ctx.dashboardTimewindow.realtime) {
                let timeShift = self.ctx.dashboardTimewindow.realtime.timewindowMs
                timeFrom = Date.now() - timeShift
                timeTo = Date.now()
            } else {
                timeFrom = self.ctx.dashboardTimewindow.history.fixedTimewindow.startTimeMs
                timeTo = self.ctx.dashboardTimewindow.history.fixedTimewindow.endTimeMs
            }
            let timeToString = new Date(timeTo).toLocaleDateString()
            let timeFromString = new Date(timeFrom).toLocaleDateString()

            return {
                timeFrom: timeFrom,
                timeTo: timeTo,
                timeFromString: timeFromString,
                timeToString: timeToString,
            }
        }

        $('input[name="datefilter"],i[name="datefilter"] ').on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('DD.MM') + '-' + picker.endDate.format('DD.MM'));
        });

        try {
            self.ctx.$scope.$on('dashboardTimewindowChanged', function () {
                $scope = self.ctx.$scope;
                $scope.ctx = self.ctx;
                $('input[name="daterange"]').data('daterangepicker').setStartDate($scope.ctx.dashboardTimewindow.history.fixedTimewindow.startTimeMs);
                $('input[name="daterange"]').data('daterangepicker').setEndDate($scope.ctx.dashboardTimewindow.history.fixedTimewindow.endTimeMs);
            })
        } catch (e) {
        }

        $('input[name="daterange"], i[name="daterange"] ').daterangepicker({
            timePicker: true,
            timePicker24Hour: true,
            startDate: getNowFromToTime().timeFromString,
            endDate: getNowFromToTime().timeToString,
            "locale": {
                "format": "DD.MM",
                "separator": " - ",
                "applyLabel": "Принять",
                "cancelLabel": "Отменить",
                "fromLabel": "От",
                "toLabel": "До",
                "customRangeLabel": "Custom",
                "weekLabel": "W",
                "daysOfWeek": ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
                "monthNames": ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
                "firstDay": 1
            },
            linkedCalendars: false,

        }, function (start, end, label) {
            let dateObjStart = new Date(start);
            let monthStart = dateObjStart.getMonth() + 1; //months from 1-12
            let dayStart = dateObjStart.getDate();
            let dateObj = new Date(end);
            let month = dateObj.getMonth() + 1; //months from 1-12
            let day = dateObj.getDate();

            newdate = `${dayStart}.${monthStart} - ${day}.${month}`

            $('#datepickerInput').val(newdate)

            ctx.timewindowFunctions.onUpdateTimewindow(start.valueOf(), end.valueOf())
        })

        // styles for datePicker
        $('.drp-calendar.right').css({'padding': '0',})
        $('.drp-calendar.right .calendar-table').css({'display': 'none',})
        $('.drp-calendar.right .calendar-time').css({'padding-left': '8px', 'padding-bottom': '8px',})
        $('.drp-calendar').css({'float': 'none',})
        $('.drp-calendar.left').css({'padding-bottom': '0',})
        $('.drp-selected').css({'display': 'none',})
        $('.btn-primary').css({
            'background-color': '#EAEAEA',
            'border': 'none',
            'color': '#525252',
            'padding': '8px 16px',
            'border-radius': '8px',
            'text-decoration': 'none',
            'display': 'inline-block',
            'font-size': '13px',
        })
        $('.cancelBtn').css({
            'background-color': '#B3B3B3',
            'border': 'none',
            'color': '#525252',
            'padding': '8px 16px',
            'border-radius': '8px',
            'text-decoration': 'none',
            'display': 'inline-block',
            'font-size': '13px',
        })
        $('.daterangepicker .drp-buttons').css({
            'display': 'flex',
            'justify-content': 'space-around'
        })
        $('.daterangepicker').css({
            'border': '3px solid #EAEAEA',
            'border-radius': '10px'
        })
        $('#mainHeadMenuButton').click(() => {
            if ($('#checkbox3').is(':checked')) {
                $('#checkbox3').prop('checked', false);
            } else {
                $('#checkbox3').prop('checked', true);
            }
            self.onResize()
        })

    });

    $(document).undelegate(".accordeon > li > a, .lineLevel > li > a", 'click')

    $(document).delegate(".accordeon > li > a, .lineLevel > li > a", 'click', function (e) {
        e.preventDefault();
        const menu = $(this).closest('.accordeon');

        if ($(this).next().is(':visible') === false) {
            menu.find('li').removeClass('slide active')
            menu.find('ul').slideUp()
        }

        if ($(this).next()[0].localName === 'span') {
            $(this).next().next().slideToggle()
        } else {
            $(this).next().slideToggle()
        }
    })

    $('#mainHeadMenuButton').click(() => {
        mainHeadMenuButtonClicked()
    })

    $(document).on('mouseenter', '.horizontalNavigation', function (event) {

        class HtmlRow {
            constructor() {
                this.rows = []
            }
            addElement(id, entityType, name, stateName, entityName) {
                if (stateName === self.ctx.stateController.stateValue)
                    this.rows.push(`<li class="activeState"><a  entityName=${entityName} stateName="${stateName}" entityId=${id} entityType=${entityType}>${name} </a></li>`)
                else
                    this.rows.push(`<li> <a entityName=${entityName} stateName="${stateName}" entityId=${id} entityType=${entityType}>${name}  </a>`)
            }
            showHtml() {
                let html = `<ul class='dropdownMenuList'>`
                for (let i = 0; i < this.rows.length; i++) {
                    html += ` ` + this.rows[i] + ``
                }
                html += `</ul>`
                return html
            }
        }

        const attributes = event.currentTarget.attributes
        const entityId = attributes.entityid.value
        const entityType = attributes.entitytype.value
        const entityName = attributes.entityName.value
        const offsetLeft = event.currentTarget.offsetLeft
        const customEntityType = attributes.statename.value
        const html = new HtmlRow()

        switch (customEntityType) {
            case 'machine': {
                html.addElement(entityId, entityType, 'Параметры работы', 'machine', entityName)
                html.addElement(entityId, entityType, 'Технологические параметры', 'machine_parameters', entityName)
                html.addElement(entityId, entityType, 'Архив событий', 'machine_alarms', entityName)
                break;
            }
            case 'section': {
                html.addElement(entityId, entityType, 'Параметры работы', 'section')
                html.addElement(entityId, entityType, 'Архив событий', 'section_alarms')
                html.addElement(entityId, entityType, 'Отчет', 'section_report')
                break;
            }
            case 'workshop': {
                html.addElement(entityId, entityType, 'Параметры работы', 'workshop')
                html.addElement(entityId, entityType, 'Архив событий', 'workshop_alarms')
                html.addElement(entityId, entityType, 'Отчет', 'workshop_report')
                break;
            }
        }
        $("#dropdownMenu").html(html.showHtml())
        $(".activeState").css('background', '#EAEAEA')
        $('#dropdownMenu').css('margin-top', $('#mainHeadMenu')[0].offsetHeight)
        $('#dropdownMenu').css('margin-left', offsetLeft + 180 + "px")
        $('#dropdownMenu').css('visibility', 'visible')


    }).on('mouseleave', '#hN', function (event) {
        setTimeout(function () {
            if ($('#hN:hover').length == 0) {
                $('#dropdownMenu').css('visibility', 'hidden')
            }
        }, 1000);
    });

    const actionDescriptors = self.ctx.actionsApi.getActionDescriptors('elementClick')

    $('#toDashboardAdministration').click((e) => {
        e.preventDefault()
        self.ctx.actionsApi.handleWidgetAction(e, actionDescriptors[2], null, null);
    })
    $('#toDashboardSisRequirements').click((e) => {
        e.preventDefault()
        self.ctx.actionsApi.handleWidgetAction(e, actionDescriptors[3], null, null);
    })
    $(document).delegate("#toDashboardEdit", 'click', function (e) {
        e.preventDefault();
        self.ctx.actionsApi.handleWidgetAction(e, actionDescriptors[1], null, null);
    });
    $(document).delegate("#roleTologOut", 'click', function (e) {
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('jwt_token_expiration')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('refresh_token_expiration')
        window.location.href = 'http://' + window.location.host + '/login';
    })
    $(document).delegate("[entityid]", 'click', function (e) {

        const machineStatesMap = {
            "ОбандероливающаяCHRIST": 'christ',
            "СмешиваниеРМ1000-L.B.BOHLE": 'bohle',
            "ТаблетированиеXL400FT-KORSCHAG": 'korsch',
            "КартонирующаяCMP-100-HeinoIlsemann": 'cmp_100_heino_ilsemann',
            "НасыщениеHDGC100-HUTTLIN": 'huttlin',
            "БлистернаяBMP-250R-HeinoIlsemann": 'bmp_250r_heino_ilsemann',
        }

        function generateMachineState(name, state) {
            if (state === 'machine_alarms' ||
                state.indexOf('machine') === -1 ||
                typeof machineStatesMap[name] == 'undefined')
                return state
            if (state === 'machine')
                return machineStatesMap[name] + '_main'
            if (state === 'machine_parameters')
                return machineStatesMap[name] + '_graph'
        }

        e.preventDefault();
        const attributes = e.currentTarget.attributes
        const nowObj = self.ctx.actionsApi.getActiveEntityInfo()
        const entityId = nowObj.entityId.id
        const stateName = attributes.statename.value
        const entityType = attributes.entitytype.value

        if (attributes.entityid.value === entityId && self.ctx.stateController.stateValue === stateName)
            return

        const entityName = e.currentTarget.innerHTML
        const entityDescriptor = {
            id: attributes.entityid.value,
            entityType: entityType
        }
        let actionDescriptor = self.ctx.actionsApi.getActionDescriptors('elementClick')[0]

        if (entityType.toLowerCase() !== 'device')
            actionDescriptor.targetDashboardStateId = stateName
        else {
            actionDescriptor.targetDashboardStateId = generateMachineState(
                attributes.entityName.value,
                stateName,
            )
        }
        self.ctx.actionsApi.handleWidgetAction(e, actionDescriptor, entityDescriptor, entityName);
    });
}

function horizontalNavigation() {

    class HtmlRow {
        constructor() {
            this.arrow = `<i class="fa fa-angle-right fa-lg " style="color: #969CBA"></i>`
            this.elements = []
        }
        addElement(id, entityType, name, stateName) {
            this.elements.push(`style="padding-right:10px" class="horizontalNavigation" stateName="${stateName}" entityId=${id} entityName=${name.replace(/\s+/g, '')} entityType=${entityType}>${name}`)
        }
        showHtml() {
            let html = ``
            for (let i = 0; i < this.elements.length - 1; i++) {
                html += this.arrow
                html += `<a ` + this.elements[i] + `</a>`
            }
            html += this.arrow
            html += `<a style="padding-left:10px" class="horizontalNavigation" ` + this.elements[this.elements.length - 1] + `</a>`
            return html
        }
    }

    let nowObj = self.ctx.actionsApi.getActiveEntityInfo()
    let entityId = nowObj.entityId.id
    let entityList = structure
    let html = new HtmlRow();

    for (let ws = 0; ws < entityList.length; ws++) {
        if (entityList[ws].id === entityId) {
            html.addElement(entityList[ws].id, entityList[ws].entity_type, entityList[ws].name, 'workshop')
            break;
        }
        if (entityList[ws].childs && !entityList[ws].childs.error && entityList[ws].childs.length > 0) {
            let sections = entityList[ws].childs
            for (let s = 0; s < sections.length; s++) {
                if (sections[s].id === entityId) {
                    html.addElement(entityList[ws].id, entityList[ws].entity_type, entityList[ws].name, 'workshop')
                    html.addElement(sections[s].id, sections[s].entity_type, sections[s].name, 'section')
                    break;
                }
                if (sections[s].childs && !sections[s].childs.error && sections[s].childs.length > 0) {
                    for (let m = 0; m < sections[s].childs.length; m++) {
                        let machine = sections[s].childs[m]
                        if (machine.id === entityId) {
                            html.addElement(entityList[ws].id, entityList[ws].entity_type, entityList[ws].name, 'workshop')
                            html.addElement(sections[s].id, sections[s].entity_type, sections[s].name, 'section')
                            html.addElement(machine.id, machine.entity_type, machine.name, 'machine')
                            break;
                        }
                    }
                }
            }
        }
    }

    $('#horizontalNavigation').html(html.showHtml())

    // БЛОКИРОВКА КНОПОК 'СЛЕД'-'ПРЕД'
    const machinePage = $('[statename="machine"].horizontalNavigation').html()?.toLowerCase().replace(/\s+/g, '');
    const sectionPage = $('[statename="section"].horizontalNavigation').html()?.toLowerCase().replace(/\s+/g, '');
    const workshopPage = $('[statename="workshop"].horizontalNavigation').html()?.toLowerCase().replace(/\s+/g, '');

    if (!sectionPage && !machinePage) {// ЦЕХ
        disablePrevNextBtn(structure, workshopPage)
    } else if (!machinePage && sectionPage) {// ЛИНИЯ
        disablePrevNextBtn(structure, sectionPage)
    } else if (machinePage) {// ОБОРУДОВАНИЕ
        disablePrevNextBtn(structure, machinePage)
    }

    $(document).delegate("#paginatorNext, #paginatorPrev", 'click', function (e) {
        let shift = 0
        switch (e.target.id.toLowerCase()) {
            case "paginatornext":
                shift = 1
                break;
            case "paginatorprev":
                shift = -1
                break;
        }
        e.preventDefault()
        let nowObj = self.ctx.actionsApi.getActiveEntityInfo()
        let nowId = nowObj.entityId.id
        let entityList = structure
        let goalEntity = {}

        for (let ws = 0; ws < entityList.length; ws++) {
            if (entityList[ws].id === nowId) {
                if (typeof entityList[ws + shift] == 'undefined')
                    return
                goalEntity = entityList[ws + shift]
                break
            }

            if (entityList[ws].childs && !entityList[ws].childs.error && entityList[ws].childs.length > 0) {
                //Линия есть, тоже пушим
                let sections = entityList[ws].childs
                for (let s = 0; s < sections.length; s++) {
                    if (sections[s].id === nowId) {
                        if (typeof sections[s + shift] == 'undefined')
                            return
                        goalEntity = sections[s + shift]
                        break
                    }

                    if (sections[s].childs && !sections[s].childs.error && sections[s].childs.length > 0) {
                        //И оборудование есть, пушим финалочку
                        for (let m = 0; m < sections[s].childs.length; m++) {
                            let machine = sections[s].childs[m]
                            if (machine.id === nowId) {
                                if (typeof sections[s].childs[m + shift] == 'undefined')
                                    return
                                goalEntity = sections[s].childs[m + shift]
                                break
                            }
                        }
                    }
                }
            }
        }
        const machineStatesMap = {
            "Обандероливающая CHRIST": 'christ',
            "Смешивание РМ 1000-L.B.BOHLE": 'bohle',
            "Таблетирование XL 400 FT-KORSCH AG": 'korsch',
            "Картонирующая CMP-100-Heino Ilsemann": 'cmp_100_heino_ilsemann',
            "Насыщение HDGC100-HUTTLIN": 'huttlin',
            "Блистерная BMP-250R-Heino Ilsemann": 'bmp_250r_heino_ilsemann',
        }

        let entityName = e.currentTarget.innerHTML
        let entityDescriptor = {
            id: goalEntity.id,
            entityType: goalEntity.entity_type
        }

        let actionDescriptor = self.ctx.actionsApi.getActionDescriptors('elementClick')[0]
        let nowState = self.ctx.stateController.stateValue
        if (nowState.indexOf('_graph') !== -1) {
            nowState = machineStatesMap[goalEntity.name] + nowState.slice(nowState.indexOf('_graph'))
        } else if (nowState.indexOf('_main') !== -1) {
            nowState = machineStatesMap[goalEntity.name] + nowState.slice(nowState.indexOf('_main'))
        }

        actionDescriptor.targetDashboardStateId = nowState

        //  Для перехода между состояниями дашборда
        // self.ctx.stateController.openState(goalEntity.id, {}, false)

        self.ctx.actionsApi.handleWidgetAction(e, actionDescriptor, entityDescriptor, entityName)
    })
    // end delegate paginator
}

function disablePrevNextBtn(structure, currentPage) {
    structure.forEach((item, index) => {
        const pageName = item.name.toLowerCase().replace(/\s+/g, '')
        const haveChild = item.childs?.length || 0
        const length = structure.length
        const paginator_a = $('#paginator a')

        if (currentPage === pageName && index === 0 && length > 1) {
            paginator_a[1].classList.remove('disableLink')
        } else if (pageName === currentPage && length - 1 === index && length > 1) {
            paginator_a[0].classList.remove('disableLink')
        } else if (pageName === currentPage && index !== 0 && length - 1 !== index) {
            paginator_a.removeClass('disableLink')
        }

        if (haveChild) {
            disablePrevNextBtn(item.childs, currentPage)
        }
    })
}

function drawCheckboxForCalendar() {
    self.ctx.interval.clearAll()
    // при подгрузке страницы
    let selectedRealTime = JSON.parse(localStorage.getItem('selectedRealTime'))

    if (selectedRealTime) {
        self.ctx.interval.clearAll()

        self.ctx.interval.make(() => {
            let milliseconds = Date.now()
            ctx.timewindowFunctions.onUpdateTimewindow(milliseconds - selectedRealTime.value, milliseconds)
        }, 15000)
    }

    $(`#datepicker`).click((event) => {
        let dateRangePicker = $('.daterangepicker')
        let top = dateRangePicker[dateRangePicker.length - 1].getBoundingClientRect().top

        $(`.daterangepicker > #toggleForCalendar`).remove()
        $(`.daterangepicker > .opacity_box`).remove()
        dateRangePicker.append(`
            <div class="opacity_box"></div>
            <div id="toggleForCalendar" style="
                position: fixed;
                display: flex;
                justify-content: space-around;
                width: 242px;
                top: ${top + 300}px;">
                <input id="toggleInp" style=" width: 20px; height: 20px;" type="checkbox">
                <label style="display:flex; align-items:center; font-size: 12px; color:gray;">Последние:</label>
                <select disabled="disabled">
                    <option></option>
                    <option data-realTime="3600000">1 час</option>
                    <option data-realTime="7200000">2 часа</option>
                    <option data-realTime="18000000">5 часов</option>
                    <option data-realTime="36000000">10 часов</option>
                    <option data-realTime="86400000">1 день</option>
                </select>
            </div>
        `)
        $('.opacity_box').css({
            'position': 'fixed',
            'top': `${top + 5}px`,
            'width': '244px',
            'height': '290px',
            'background': '#eee',
            'opacity': '0.6',
            'filter': 'blur(3px)',
            'display': 'none'
        })
        let toggleForCalendarSelect = $('#toggleForCalendar select')
        $(`.daterangepicker .drp-calendar.right`).css({'padding-bottom': '26px'})
        $(`.daterangepicker #toggleForCalendar select`).css({
            'border-color': '#d6d5d5', 'border-radius': '7px',
            'font-size': '12px',
            'font-weight': 'bold',
        })
        $(`.daterangepicker #toggleForCalendar select option`).css({'font-size': '12px', 'font-weight': 'bold'})

        // при подгрузке страницы
        let selectedRealTime = JSON.parse(localStorage.getItem('selectedRealTime'))

        if (selectedRealTime) { // если localStorage не пустой
            if (selectedRealTime.checked) {
                $(`.daterangepicker input[type="checkbox"]`).prop('checked', true)
                toggleForCalendarSelect.removeAttr('disabled')
                $('.opacity_box').css({'display': 'block'})
            } else {
                toggleForCalendarSelect.attr('disabled', 'disabled')
                $('.opacity_box').css({'display': 'none'})
                self.ctx.interval.clearAll()
            }

            Array.from($(`option[data-realTime]`)).forEach((opt) => {
                if (opt.dataset.realtime == selectedRealTime.value) {
                    $(opt).prop('selected', true)
                }
            })
        }

        if ($(`#toggleForCalendar input[type="checkbox"]`)[1].checked) {
            toggleForCalendarSelect.removeAttr('disabled')
        } else if (!event.target.checked) {
            toggleForCalendarSelect.attr('disabled', 'disabled')
        }

        $(`#toggleForCalendar input[type="checkbox"]`).click((toggle) => {
            if (toggle.target.checked) {
                toggleForCalendarSelect.removeAttr('disabled')
                $('.opacity_box').css({'display': 'block'})
                $(`#toggleForCalendar input[type="checkbox"]`).css({'background-color': ''})

            } else if (!toggle.target.checked) {
                toggleForCalendarSelect.attr('disabled', 'disabled')
                $('.opacity_box').css({'display': 'none'})

                self.ctx.interval.clearAll()

                localStorage.removeItem('selectedRealTime')
                Array.from($(`option[data-realTime]`)).forEach((opt) => {
                    if (opt.innerHTML === '') {
                        $(opt).prop('selected', true)
                    }
                })
            }
        })

        toggleForCalendarSelect.change((event) => {
            let value
            if (event.target.value !== '') {
                switch (event.target.value) {
                    case '1 час':
                        value = 3600000
                        break;
                    case '2 часа':
                        value = 7200000
                        break;
                    case '5 часов':
                        value = 18000000
                        break;
                    case '10 часов':
                        value = 36000000
                        break;
                    case '1 день':
                        value = 86400000
                        break;
                }

                $(`.applyBtn`).click(() => {
                    let checkboxes = $(`#toggleForCalendar input[type="checkbox"]`)
                    if (checkboxes[checkboxes.length - 1].checked) {
                        let realtimeObj = {
                            value: value,
                            checked: true
                        }
                        localStorage.setItem('selectedRealTime', JSON.stringify(realtimeObj))
                        self.ctx.interval.clearAll()

                        function updateTime() {
                            let milliseconds = Date.now()
                            ctx.timewindowFunctions.onUpdateTimewindow(milliseconds - value, milliseconds)
                        }

                        updateTime()
                        self.ctx.interval.make(() => {
                            updateTime()
                        }, 5000)
                    } else {
                        self.ctx.interval.clearAll()
                    }
                })
            }
        })

        // clear all listeners
        $(".applyBtn").off()

        $(`.applyBtn`).click(() => {
            if (self.ctx && self.ctx.dashboardTimewindow.history) {
                const oldDate = self.ctx.dashboardTimewindow.history.fixedTimewindow.startTimeMs

                let interval = setInterval(() => {
                    const timeFrom = self.ctx.dashboardTimewindow.history.fixedTimewindow.startTimeMs

                    if (oldDate != timeFrom) {
                        let timeFrom = self.ctx.dashboardTimewindow.history.fixedTimewindow.startTimeMs,
                            timeTo = self.ctx.dashboardTimewindow.history.fixedTimewindow.endTimeMs,
                            from = new Date(timeFrom),
                            to = new Date(timeTo)

                        sessionStorage.setItem('selectedDate', JSON.stringify({
                            from: timeFrom,
                            to: timeTo
                        }))

                        clearInterval(interval)
                    }
                }, 1000)
            }
        })
    })
}

self.onInit = function () {

    self.ctx.interval = {
        intervals: [],
        make(func, duration) {
            let newInterval = setInterval(func, duration)
            this.intervals.push(newInterval)
            return newInterval
        },
        clear(id) {
            this.intervals.splice(this.intervals.indexOf(id), 1)
            return clearInterval(id)
        },
        clearAll() {
            this.intervals.forEach((id) => {
                this.clear(id)
            })
        }
    }

    self.ctx.interval.clearAll()

    drawCheckboxForCalendar()
    getEntityMap()
    initialize()
    jqueryActions()
    self.onResize()
    syncingDates()

    // открытие с анимацией
    $('.userInfo').click((e) => {
        let x = document.getElementById("roleDropdownMenu");
        if (x.style.display != "none" && x.style.display != "") {
            $('#roleDropdownMenu').hide(200)
        } else {
            $('.userInfo .dropdownWindow').show(200)
            $('.userInfo .dropdownWindow').mouseleave(function () {
                setTimeout(function () {
                    $('.userInfo >.icon >.span_icon').toggleClass('active')
                    $('#roleDropdownMenu').hide(200)
                }, 200);
            })
        }
    })
    // переворот стрелки
    $('.userInfo').click(function (e) {
        e.preventDefault();
        $(this).find('span.span_icon').toggleClass('active');
    })

    $('#burgerMenu').click(event => {
        const classList = event.target.classList
        if (classList.contains('lineLevel') && !classList.contains('active')
            || classList.contains('fa-angle-down') && !classList.contains('active')) {
            classList.add('active')
        } else {
            classList.remove('active')
        }
    })

    getCustomerRole()

    let currentUser = JSON.parse(localStorage.getItem('currentUser'))
    let userName = ''

    if (typeof currentUser.lastName != 'undefined')
        userName += currentUser.lastName
    if (typeof currentUser.firstName != 'undefined')
        userName += ' ' + currentUser.firstName

    $('.info #userName').html(`${userName}`)
    $('.info #userRole').html(`${currentUser.roleName}`)
}

function getCustomerRole() {
    let user = {}
    if (self.ctx.dashboard.authUser.authority === "TENANT_ADMIN") {
        user.lastName = self.ctx.dashboard.authUser.sub
        user.role = 'administrator'
        user.roleName = 'Редактор'
    } else {

        for (let i = 0; i < self.ctx.data.length; i++) {
            if (self.ctx.data[i].datasource.entityType !== 'USER')
                continue
            let key = self.ctx.data[i].dataKey.name
            let value = self.ctx.data[i].data[0][1]
            user[key] = value
        }
        switch (user.role) {
            case 'administrator':
                user.roleName = 'Администратор'
                break
            case 'engineer':
                user.roleName = 'Инженер'
                break
            case 'operator':
                user.roleName = 'Оператор'
                break
        }

    }
    localStorage.setItem('currentUser', JSON.stringify(user))
    return user
}

self.onResize = function () {
    $('#burgerMenu').css('left', $('.logoIcon')[0].width + 10 + parseInt($('#mainHeadMenuButton').css('margin-left').replace('px', "")))
    $('#burgerMenu').css('top', $('.logoIcon')[0].width)
    $('#horizontalNavigation').css('top', $('#mainHeadMenu')[0].offsetHeight / 2 - 12)
    $('#paginator').css('top', $('#mainHeadMenu')[0].offsetHeight / 2 - 12)
    $('#datepickerInput').css('top', $('#paginator').css('top'))
}

self.onDataUpdated = function () {
}

self.typeParameters = function () {
    return {
        maxDatasources: 2,
        dataKeysOptional: true
    };
}

self.actionSources = function () {
    return {
        'elementClick': {
            name: 'widget-action.element-click',
            multiple: true
        }
    };
}

self.onDestroy = function () {
    self.ctx.interval.clearAll()
}
