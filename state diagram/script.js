self.onInit = function () {
    self.ctx.flot = new TbFlot(self.ctx, 'state');

    // changeChartColors(self.ctx.flot)
}

self.onDataUpdated = function () {
    if (!self.ctx.flot)
        return

    self.ctx.flot.update()
    $(`.tb-widget-loading`).hide()

    translateDate()
}

function changeChartColors(flot) {
    const deviceName = self.ctx.datasources[0].name
    const dataKeys = self.ctx.datasources[0].dataKeys

    self.ctx.deviceService.findByName(deviceName).subscribe(device => {
        self.ctx.attributeService.getEntityAttributes({
            id: device.id.id, entityType: 'DEVICE'
        }, 'SERVER_SCOPE', ['productList']).subscribe(attributes => {
            const productList = JSON.parse(attributes[0].value)


            productList.forEach((item) => {
                dataKeys.forEach((key, ind) => {
                    if (key.name === item.key && item.color) {

                        flot.options.colors[ind] = item.color
                        dataKeys[ind].color = item.color
                        dataKeys[ind].backgroundColor = item.color
                        self.ctx.data[ind].highlightColor = item.color

                        self.ctx.widgetConfig.datasources[0].dataKeys[ind].color = item.color

                        // self.ctx.widgetConfig.datasources[0].dataKeys[0].settings.fillLines
                    }
                })
            })

            flot.update()
            // self.ctx.updateWidgetParams()
            // self.ctx.detectChanges()
        })
    })
}

function translateDate() {
    const locale = returnLocale()
    const dates = self.ctx.$container[0].querySelectorAll('.flot-x-axis div')
    const russianWords = /[а-яё]/i;
    const isOnlyNumbers = str => /^\d+$/.test(
        str.replace(/[^a-zа-яё0-9\s]/gi, ' ').replace(/\s/g, ''))

    Array.from(dates).forEach(date => {
        const value = date.innerHTML
        const number = isOnlyNumbers(value) ? value : value.slice(value.indexOf(" "))

        if (!russianWords.test(value)) {
            const month = value.slice(0, value.indexOf(" "))
            date.innerHTML = `${locale[month] || ''} ${number}`
        }
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
