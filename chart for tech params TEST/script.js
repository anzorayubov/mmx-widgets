self.onInit = function () {
    self.ctx.flot = new TbFlot(self.ctx);
    self.ctx.updateWidgetParams();

    updateParamsStatus()

    addCheckboxes()
}

self.onDataUpdated = function () {
    self.ctx.flot.update()

    showLastValuesInLegend()

    translateDate()
}

const selectedParams = JSON.parse(sessionStorage.getItem('selected_tech_params')) || []
const clickEvent = new Event('click')

function updateParamsStatus() {
    const list = self.ctx.$container[0].closest('tb-widget').querySelector('tbody')
    const items = list.childNodes
    const itemsArr = []
    const labels = Array.from($('.tb-legend-keys td:nth-child(2)'))

    labels.forEach((item, inx) => {
        const label = removeSpacesAndNums(item.innerHTML)

        if (selectedParams.includes(label)) {
            item.dispatchEvent(clickEvent)
        }
    })
}

function addCheckboxes() {
    const labels = $('.tb-legend-keys td:first-child')
    const keys = Array.from($('.tb-legend-keys td:nth-child(2)'))

    labels.css({'display': 'flex', 'align-items': 'center'})
    labels.append(`
        <input style="width: 14px; height: 14px;" type="checkbox" checked/>`)

    const checkboxes = $('.tb-legend-keys td:first-child input')

    keys.forEach((key, index) => {
        const text = removeSpacesAndNums(key.innerHTML)
        if (selectedParams.includes(text)) {
            checkboxes[index].checked = false
        }
    })

    $('.tb-legend-keys td').click(debounce(event => {
        const target = event.target
        const checkbox = target.closest('tr').querySelector('input')

        if (target.className.includes('tb-legend-label')) {
            checkbox.checked = !checkbox.checked
            const value = removeSpacesAndNums(target.innerText)

            saveParamsToStorage(value)
        }
    }, 100))

    checkboxes.click(event => {
        const label = event.target.closest('tr').querySelector('.tb-legend-label')
        label.dispatchEvent(clickEvent)

        const value = removeSpacesAndNums(label.innerText)
        saveParamsToStorage(value)
    })

    function saveParamsToStorage(value) {
        if (selectedParams.includes(value)) {
            const index = selectedParams.indexOf(value)
            selectedParams.splice(index, 1)
        } else if (!selectedParams.includes(value)) {
            selectedParams.push(value)
        }
        sessionStorage.setItem('selected_tech_params', JSON.stringify(selectedParams))
    }

    $('.tb-legend-keys td').css({'text-decoration': 'none', 'opacity': 1})
}

function showLastValuesInLegend() {
    const lastValues = []
    const arrayLabels = document.querySelectorAll('.tb-legend-keys td:nth-child(2)')

    self.ctx.data.forEach((obj, index) => {
        const lastValue = obj.data[obj.data.length - 1]
        const label = obj.dataKey.label.trim()

        if (lastValue) {
            let innerHTML = arrayLabels[index].innerHTML
            lastValues.push({
                name: label,
                value: +lastValue[1].toFixed(2)
            })
        } else if (obj.data.length < 1) {
            lastValues.push({
                name: '',
                value: ''
            })
        }
    })

    lastValues.forEach(val => {
        arrayLabels.forEach((label, index) => {
            const html = label.innerHTML.slice(0, label.innerHTML.lastIndexOf('|')).trim()

            if (val.name.trim() === html) {
                label.innerHTML = `${html} | ${val.value}`
            }
        })
    })

}

function removeSpacesAndNums(str) {
    return str.replace(/[^a-zA-ZА-Яа-яЁё]/gi, '').replace(/\s+/gi, ', ')
}

function debounce(fn, wait) {
    let timeout
    return function (...args) {
        const later = () => {
            clearTimeout(timeout)
            fn.apply(this, args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
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

self.onResize = function () {
    self.ctx.flot.resize();
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
