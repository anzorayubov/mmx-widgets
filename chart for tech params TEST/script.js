self.onInit = function () {
    self.ctx.flot = new TbFlot(self.ctx);
    self.ctx.updateWidgetParams();

    addCheckboxes()
}

self.onDataUpdated = function () {
    self.ctx.flot.update();

    showLastValuesInLegend()
}

function addCheckboxes() {
    const labels = $('.tb-legend-keys td:first-child')

    labels.css({'display': 'flex', 'align-items': 'center'})
    labels.append(`
        <input style="width: 14px; height: 14px;" type="checkbox" checked/>`)

    $('.tb-legend-keys td').click(debounce(event => {
        const input = event.target.closest('tr').querySelector('input')

        if (event.target.className.includes('tb-legend-label')) {
            input.checked = !input.checked
        }
    }, 100))

    $('.tb-legend-keys td:first-child input').click(event => {
        const label = event.target.closest('tr').querySelector('.tb-legend-label')
        const clickEvent = new Event('click')

        label.dispatchEvent(clickEvent)
    })

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
