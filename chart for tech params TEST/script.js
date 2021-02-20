self.onInit = function() {
    self.ctx.flot = new TbFlot(self.ctx);
    const entityName = self.ctx.datasources[0].entityName
    self.ctx.updateWidgetParams();
}

self.onDataUpdated = function() {
    self.ctx.flot.update();

    const tbKeys = document.querySelectorAll('.tb-legend-keys td:last-child')
    const lastValues = []
    const arrayLabels = document.querySelectorAll('.tb-legend-keys td:nth-child(2)')
    const array = self.ctx.data

    array.forEach((obj, index) => {
        const lastValue = obj.data[obj.data.length-1]
        const label = obj.dataKey.label.trim()

        if (lastValue) {
            let innerHTML = arrayLabels[index].innerHTML
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
        arrayLabels.forEach((label, index) => {
            if (val.name.trim() == label.innerHTML.trim()) {
                label.innerHTML += `| ${val.value}`
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
