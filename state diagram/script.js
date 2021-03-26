self.onInit = function () {
    self.ctx.flot = new TbFlot(self.ctx, 'state');

    tooltipFormatter()
}

self.onDataUpdated = function () {
    if (!self.ctx.flot)
        return

    self.ctx.flot.update()
    $(`.tb-widget-loading`).hide()

    translateDate()
}

function translateDate() {
    const locale = getLocale()
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

function getLocale() {
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

function tooltipFormatter() {
    const target = document.querySelector('.flot-mouse-value')
    const config = {attributes: true, childList: true, characterData: true}
    const options = {
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
    }
    
    const observer = new MutationObserver(tooltip => {
        tooltip.forEach(date => {
            const oldDate = date.target.firstChild.innerHTML
            const newDate = new Date(Date.parse(oldDate)).toLocaleString("ru", options)

            if (Date.parse(oldDate) && oldDate !== newDate) {
                date.target.firstChild.innerHTML = newDate
            }

            translateOnOff(date.target.childNodes)
        })
    })

    observer.observe(target, config)
    // observer.disconnect()
}

function translateOnOff(node) {
    Array.from(node).forEach(item => {
        item.innerHTML = item.innerHTML === 'On' ?
            'Вкл' : item.innerHTML === 'Off' ?
            'Выкл' : item.innerHTML

        if (item.childNodes) {
            translateOnOff(item.childNodes)
        }
    })
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
