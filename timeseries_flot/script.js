self.onInit = function () {
    self.ctx.flot = new TbFlot(self.ctx, 'state');

    const deviceName = self.ctx.datasources[0].name

    // ctx.deviceService.findByName(deviceName).subscribe(device => {
    //     const deviceId = device.id.id

    //     ctx.attributeService.getEntityAttributes({id: deviceId, entityType: 'DEVICE'}, 'SERVER_SCOPE', ['color'])
    //         .subscribe(attributes => {
    //             // console.log(attributes[0])

    //         })
    // })

    // console.log($('.flot-text .flot-x-axis')) // ДАТЫ!


    const fistKey = self.ctx.widgetConfig.datasources[0].dataKeys[0]

    self.ctx.flot.options.colors[0] = '#dd22aa'

    self.ctx.flot.update()

    console.log('flot', self.ctx.flot.options)

    setTimeout(() => {


    }, 1000);

}

self.onDataUpdated = function () {
    if (typeof self.ctx.flot == 'undefined')
        return

    try {
        self.ctx.flot.update()
        $(`.tb-widget-loading`).hide()
        // mat-spinner - дефолтный лоадер
    } catch (e) {
        console.log(e)
    }


    // ctx.widgetConfig.datasources[0].dataKeys[0].settings.fillLines = true

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
