const structure = {};

function mainHeadMenuButtonClicked() {
    const x = document.getElementById("burgerMenu");
    if (x.style.display !== "none") {
        $('#burgerMenu').hide(200)
    } else {
        $('#burgerMenu').show(200)
        $('#burgerMenu').mouseleave(() => {
            setTimeout(() => {
                if ($('.accordeon:hover').length === 0) {
                    $('#burgerMenu').hide(200)
                    $('#checkbox3').prop('checked', false);
                }
            }, 500);
        })
    }
}

function drawBurgerMap(entityList) {
    if (entityList[0] === 'Справка') {
        $('#mainHeadMenuButton').hide()
    }
    $('#burgerMenu').append(`<ul class="accordeon"></ul>`)

    for (let ws = 0; ws < entityList.length; ws++) {
        if (entityList[ws] !== '') {
            // надо отфильтровать
            if (typeof entityList[ws] != 'undefined')
                if (entityList[ws].toLowerCase().includes('details'))
                    continue;
            $('#burgerMenu ul').append(`
    	        <li id="${entityList[ws]}">${entityList[ws] === 'default' ?
                'Список справочников' : entityList[ws] === 'lines' ?
                    'Справочник линий' : entityList[ws] === 'machine' ?
                        'Справочник оборудования' : entityList[ws] === 'parameters' ?
                            'Справочник параметров' : entityList[ws] === 'workshop' ?
                                'Справочник цехов' : entityList[ws] === 'states' ?
                                    'Справочник состояний' : ''
            }</li>`)
        }
    }

    $('#burgerMenu ul li').click((event) => {
        self.ctx.stateController.openState(event.target.id, {}, false);
    })
}

function initialize() {
    mainHeadMenuButtonClicked()
    $(document).undelegate('#burgerMenu', 'click')
    $(document).undelegate('#mainHeadMenuButton', 'click')
    $(document).undelegate(".accordeon > li > a, .lineLevel > li > a", 'click')
    let gridsters = $('gridster-item')
    for (let i = 0; i < gridsters.length; i++) {
        if (gridsters[i].textContent.indexOf('mainMenu') !== -1)
            continue;
        gridsters[i].style['z-index'] = 0
    }

    self.ctx.$container.closest('gridster-item')[0].style.zIndex = 999999;
}

function jqueryActions() {
    if (typeof self.ctx.stateController != 'undefined') {
        if (self.ctx.stateController.stateValue === 'default')
            $('.paginator_btn').hide()
    }

    let arrayStates = []
    for (let key in self.ctx.stateController?.states) {
        arrayStates.push(self.ctx.stateController?.states[key].name)
    }
    drawBurgerMap(arrayStates)

    $('.paginator_btn').click((event) => {
        let text = event.target.innerText.toLowerCase()

        for (let i = 1; i < arrayStates.length; i++) {
            if (arrayStates[i] === self.ctx.stateController?.stateValue) {
                if (arrayStates[i] === 'default') {
                    $('#btn_prev_state').prop("disabled", true)
                    return
                } else {
                    self.ctx.stateController.openState(arrayStates[i + (text.includes('след') ? 1 : -2)], {}, false);
                }
            }
        }
    })

    $(function () {
        function getNowFromToTime() {
            let timeFrom
            let timeTo
            if (typeof self.ctx.dashboardTimewindow.realtime !== 'undefined') {
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
            $(this).val(picker.startDate.format('DD.MM') + ' - ' + picker.endDate.format('DD.MM'));
        })

        try {
            self.ctx.$scope.$on('dashboardTimewindowChanged', function () {
                $scope = self.ctx.$scope;
                $scope.ctx = self.ctx;

                $('input[name="daterange"]').data('daterangepicker').setStartDate($scope.ctx.dashboardTimewindow.history.fixedTimewindow.startTimeMs);
                $('input[name="daterange"]').data('daterangepicker').setEndDate($scope.ctx.dashboardTimewindow.history.fixedTimewindow.endTimeMs);
            })
        } catch (e) {
            // console.log(e)
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
                "monthNames": [
                    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль",
                    "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
                ],
                "firstDay": 1
            },
            linkedCalendars: false,
        }, function (start, end) {
            ctx.timewindowFunctions.onUpdateTimewindow(start.valueOf(), end.valueOf())
        })

        // styles for datePicker
        $('.drp-calendar.right').css({'padding': '0',})
        $('.drp-calendar.right .calendar-table').css({'display': 'none',})
        $('.drp-calendar.right .calendar-time').css({'padding-left': '8px', 'padding-bottom': '8px',})
        $('.drp-calendar').css({'float': 'none',})
        $('.drp-calendar.left').css({'padding-bottom': '0',})
        $('.drp-selected').css({
            'display': 'none',
        })
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

    $(document).delegate('#burgerMenu', 'click', (event) => {
        if (event.target.classList.contains('lineLevel') && !event.target.classList.contains('active')
            || event.target.classList.contains('fa-angle-down') && !event.target.classList.contains('active')) {
            event.target.classList.add('active')
        } else {
            event.target.classList.remove('active')
        }
    });
    $(document).delegate(".accordeon > li > a, .lineLevel > li > a", 'click', function (e) {
        e.preventDefault();
        const menu = $(this).closest('.accordeon');

        if ($(this).next().is(':visible') === false) {
            menu.find('li').removeClass('slide active');
            menu.find('ul').slideUp();
        }

        if ($(this).next()[0].localName === 'span')
            $(this).next().next().slideToggle();
        else
            $(this).next().slideToggle();
    })
    $(document).delegate('#mainHeadMenuButton', 'click', () => {
        mainHeadMenuButtonClicked()
    })

    $('#toDashboardEdit').click((e) => {
        const actionDescriptors = self.ctx.actionsApi.getActionDescriptors('elementClick')
        actionDescriptors.forEach(item => {
            if (item.name === 'Переход в мониторинг') {
                self.ctx.actionsApi.handleWidgetAction(e, item, {id: item.id})
            }
        })
    })

    $(document).delegate("#roleTologOut", 'click', function (e) {
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('jwt_token_expiration')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('refresh_token_expiration')
        $(document).undelegate(".accordeon > li > a, .lineLevel > li > a", 'click')
        $(document).undelegate("[entityid]", 'click')
        $(document).undelegate("#paginatorNext, #paginatorPrev", 'click')
        window.location.href = 'http://' + window.location.hostname + ':8080/login';
    });
    $(document).delegate("[editdashboard]", 'click', function (e) {
        e.preventDefault();
        let actionDescriptor = self.ctx.actionsApi.getActionDescriptors('elementClick')[2]
        self.ctx.actionsApi.handleWidgetAction(e, actionDescriptor, null, null);
    })
    $(document).delegate("[entityid]", 'click', function (e) {
        e.preventDefault();
        let thisClick = e.currentTarget.attributes
        let nowObj = self.ctx.actionsApi.getActiveEntityInfo()

        if (typeof nowObj !== 'undefined' && thisClick.entityid.value == nowObj.entityId.id && self.ctx.stateController.stateValue == thisClick.statename.value)
            return

        let entityName = e.currentTarget.innerHTML
        let entityDescriptor = {
            id: thisClick.entityid.value,
            entityType: thisClick.entitytype.value
        }

        let actionDescriptor = self.ctx.actionsApi.getActionDescriptors('elementClick')[1]
        actionDescriptor.targetDashboardStateId = thisClick.statename.value
        $(document).undelegate(".accordeon > li > a, .lineLevel > li > a", 'click')
        $(document).undelegate("[entityid]", 'click')
        $(document).undelegate("#paginatorNext, #paginatorPrev", 'click')
        self.ctx.actionsApi.handleWidgetAction(e, actionDescriptor, entityDescriptor, entityName);
    });

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
        e.preventDefault();
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

            if (typeof entityList[ws].childs !== 'undefined' && typeof entityList[ws].childs.error == 'undefined' && entityList[ws].childs.length > 0) {
                //Линия есть, тоже пушим
                let sections = entityList[ws].childs
                for (let s = 0; s < sections.length; s++) {
                    if (sections[s].id === nowId) {
                        if (typeof sections[s + shift] == 'undefined')
                            return
                        goalEntity = sections[s + shift]
                        break
                    }

                    if (typeof sections[s].childs !== 'undefined' && typeof sections[s].childs.error == 'undefined' && sections[s].childs.length > 0) {
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

        let actionDescriptor = self.ctx.actionsApi.getActionDescriptors('elementClick')[0]
        actionDescriptor.targetDashboardStateId = self.ctx.stateController.stateValue
        $(document).undelegate("#paginatorNext, #paginatorPrev", 'click')
        $(document).undelegate(".accordeon > li > a, .lineLevel > li > a", 'click')
        $(document).undelegate("[entityid]", 'click')
    });
}

function horizontalNavigation() {
    class HtmlRow {
        constructor() {
            this.arrow = `<i class="fa fa-angle-right fa-lg " style="color: #969CBA"></i>`//`<i class="fas fa-angle-right"></i>`
            this.elements = []
        }

        addElement(id, entityType, name, stateName) {
            this.elements.push(`style="padding-right:10px" editDashboard=true class="horizontalNavigation" stateName="${stateName}" entityType=${entityType}>${name}`)

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

    html.addElement('123', 'asset', 'Справочники', 'default')

    for (let ws = 0; ws < entityList.length; ws++) {
        if (entityList[ws].id === entityId) {
            html.addElement(entityList[ws].id, entityList[ws].entity_type, entityList[ws].name, 'workshop')
            break;
        }

        if (typeof entityList[ws].childs !== 'undefined' && typeof entityList[ws].childs.error == 'undefined' && entityList[ws].childs.length > 0) {
            let sections = entityList[ws].childs
            for (let s = 0; s < sections.length; s++) {

                if (sections[s].id === entityId) {
                    html.addElement(entityList[ws].id, entityList[ws].entity_type, entityList[ws].name, 'workshop')
                    html.addElement(sections[s].id, sections[s].entity_type, sections[s].name, 'section')
                    break;
                }

                if (typeof sections[s].childs !== 'undefined' && typeof sections[s].childs.error == 'undefined' && sections[s].childs.length > 0) {
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
}

self.onInit = function () {
    initialize()
    jqueryActions()
    getCustomerRole()
    self.onResize()

    // открытие с анимацией
    $('.userInfo').click((e) => {
        let x = document.getElementById("roleDropdownMenu");
        if (x.style.display !== "none" && x.style.display !== "") {
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
    });

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
    $(document).off()
}
