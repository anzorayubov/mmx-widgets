self.onInit = function() {
    self.ctx.flot = new TbFlot(self.ctx);
    self.ctx.updateWidgetParams();
}

self.onDataUpdated = function() {
    self.ctx.flot.update();

    const lastValues = []
    const arrayLabels = document.querySelectorAll('.tb-legend-keys td:nth-child(2)')
    const array = self.ctx.data

    array.forEach((obj) => {
        const lastValue = obj.data[obj.data.length-1]
        const label = obj.dataKey.label.trim()

        if (lastValue) {
            lastValues.push({
                name: label,
                value: +lastValue[1].toFixed(2)
            })
        } else if(obj.data.length < 1) {
            lastValues.push({
                name: '',
                value: ''
            })
        }
    })

    lastValues.forEach(val => {
        arrayLabels.forEach((label) => {
            const html = label.innerHTML.slice(0, label.innerHTML.lastIndexOf('|')).trim()
            if (val.name.trim() === html) {
                label.innerHTML = `${html} | ${val.value}`
            }
        })
    })
}

self.onResize = function() {
    self.ctx.flot.resize();
}

self.onEditModeChanged = function() {
    self.ctx.flot.checkMouseEvents();
}

self.onMobileModeChanged = function() {
    self.ctx.flot.checkMouseEvents();
}

self.getSettingsSchema = function() {
    return TbFlot.settingsSchema('graph');
}

self.getDataKeySettingsSchema = function() {
    return TbFlot.datakeySettingsSchema(true, 'graph');
}

self.onDestroy = function() {
    self.ctx.flot.destroy();
}
