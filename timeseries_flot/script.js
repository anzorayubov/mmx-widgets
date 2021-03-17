self.onInit = function () {
    const data = self.ctx.data
    const selectedParameter = JSON.parse(localStorage.getItem('selectedParameter')) || []

    // self.ctx.translate.use('ru_RU').subscribe(response => {
    //     // console.log('response',response)
    //     console.log('response',response)
    // })

    self.ctx.flot = new TbFlot(self.ctx);

    document.addEventListener('click', event => {
        // console.log()
        if (event.target.classList.value.includes('tb-legend-label')) {
            const innerHTML = event.target.innerHTML.trim();
            // если массив уже содержит элемент - удаляем его, если нет - добавляем
            if (selectedParameter.indexOf(innerHTML) !== -1) {
                const index = selectedParameter.indexOf(innerHTML);
                if (index > -1) {
                    selectedParameter.splice(index, 1);
                }
            } else {
                selectedParameter.push(innerHTML)
            }

            localStorage.setItem('selectedParameter', JSON.stringify(selectedParameter))
        }
    })
    // прокликиваем выбранные
    for (let i = 0; i < data.length; i++) {
        const labelElement = $(`td.tb-legend-label`)[i]

        if (selectedParameter.indexOf(labelElement.innerHTML.trim()) !== -1) {
            const clickEvent = new Event('click')
            labelElement.dispatchEvent(clickEvent);
        }
    }

    for (let i = 0; i < $(`td.tb-legend-label`).length; i++) {
        const labelElement = $(`td.tb-legend-label`)[i]

        labelElement.style.color = $(`.tb-legend-line`)[i].style.backgroundColor
        labelElement.style.borderColor = $(`.tb-legend-line`)[i].style.backgroundColor
    }

}

self.onDataUpdated = function () {
    self.ctx.flot.update();
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
