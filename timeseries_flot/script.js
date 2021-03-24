self.onInit = function () {
    self.ctx.flot = new TbFlot(ctx, 'state');
    const flot = self.ctx.flot

    changeChartColors(flot)

    translateDate()
}

self.onDataUpdated = function () {
    if (!self.ctx.flot)
        return

    try {
        self.ctx.flot.update()
        $(`.tb-widget-loading`).hide()
        // mat-spinner - дефолтный лоадер
    } catch (e) {
        console.log(e)
    }
}

function changeChartColors(flot) {
    const deviceName = self.ctx.datasources[0].name

    self.ctx.deviceService.findByName(deviceName).subscribe(device => {
        const deviceId = device.id.id
        self.ctx.attributeService.getEntityAttributes({
            id: deviceId, entityType: 'DEVICE'
        }, 'SERVER_SCOPE', ['color']).subscribe(attributes => {
            // console.log(attributes[0])
            const colors = attributes[0]
            let ind = 0
            for (let c in colors) {
                flot.options.colors[ind] = colors[c]
                ind++
            }
            flot.update()
        })
    })
}

function translateDate() {
    const locale = returnLocale()
    const dates = $('.flot-x-axis div')

    Array.from(dates).forEach(date => {
        const month = date.innerHTML.replace(/[0-9]/g, '').trim()
        const number = date.innerHTML.replace(/\D+/g, "")

        date.innerHTML = `${locale[month] || ''} ${number}`
    })
}

function returnLocale() {
    return {
        "Sun": "Вс",
        "Mon": "Пн",
        "Tue": "Вт",
        "Wed": "Ср",
        "Thu": "Чт",
        "Fri": "Пт",
        "Sat": "Сб",
        "Jan": "Янв.",
        "Feb": "Февр.",
        "Mar": "Март",
        "Apr": "Апр.",
        "May": "Май",
        "Jun": "Июнь",
        "Jul": "Июль",
        "Aug": "Авг.",
        "Sep": "Сент.",
        "Oct": "Окт.",
        "Nov": "Нояб.",
        "Dec": "Дек.",
        "January": "Январь",
        "February": "Февраль",
        "March": "Март",
        "April": "Апрель",
        "June": "Июнь",
        "July": "Июль",
        "August": "Август",
        "September": "Сентябрь",
        "October": "Октября",
        "November": "Ноябрь",
        "December": "Декабрь",
        "Custom Date Range": "Пользовательский диапазон дат",
        "Date Range Template": "Шаблон диапазона дат",
        "Today": "Сегодня",
        "Yesterday": "Вчера",
        "This Week": "На этой неделе",
        "Last Week": "Прошлая неделя",
        "This Month": "Этот месяц",
        "Last Month": "Прошлый месяц",
        "Year": "Год",
        "This Year": "В этом году",
        "Last Year": "Прошлый год",
        "Date picker": "Выбор даты",
        "Hour": "Час",
        "Day": "День",
        "Week": "Неделю",
        "2 weeks": "2 Недели",
        "Month": "Месяц",
        "3 months": "3 Месяца",
        "6 months": "6 Месяцев",
        "Custom interval": "Пользовательский интервал",
        "Interval": "Интервал",
        "Step size": "Размер шага",
        "Ok": "Ok"
    }
}

self.onResize = function () {
    self.ctx.flot.resize();
}

self.typeParameters = function () {
    return {
        stateData: true
    };
}

self.onEditModeChanged = function () {
    self.ctx.flot.checkMouseEvents();
}

self.onMobileModeChanged = function () {
    self.ctx.flot.checkMouseEvents();
}

self.getSettingsSchema = function () {
    return TbFlot.settingsSchema('graph');
}

self.getDataKeySettingsSchema = function () {
    return TbFlot.datakeySettingsSchema(true, 'graph');
}

self.onDestroy = function () {
    self.ctx.flot.destroy();
}
