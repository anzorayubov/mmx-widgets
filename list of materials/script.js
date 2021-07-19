const APP_PORT = 1803

self.onInit = function () {

    self.ctx.$scope.videoLinks = [
        {
            name: 'Вход в систему',
            href: `http://${window.location.hostname}:${APP_PORT}/documentation/video/0.mp4`
        },
        {
            name: 'Структура системы',
            href: `http://${window.location.hostname}:${APP_PORT}/documentation/video/1.mp4`
        },
        {
            name: 'Виджеты экрана оборудование',
            href: `http://${window.location.hostname}:${APP_PORT}/documentation/video/2.mp4`
        },
        {
            name: 'Виджеты экрана линия',
            href: `http://${window.location.hostname}:${APP_PORT}/documentation/video/3.mp4`
        },
        {
            name: 'ОЕЕ линии',
            href: `http://${window.location.hostname}:${APP_PORT}/documentation/video/4.mp4`
        }
    ]

    self.ctx.$scope.PDFLinks = [
        {
            name: 'Презентация ОЕЕ+',
            href: `http://${window.location.hostname}:${APP_PORT}/documentation/doc/презентацияОЕЕ.pdf`
        },
        {
            name: 'Расчет ОЕЕ.pdf',
            href: `http://${window.location.hostname}:${APP_PORT}/documentation/doc/расчетОЕЕ.pdf`
        }]

    self.ctx.$scope.linkClicked = (_, event) => {
        event.preventDefault()
        const link = event.target.href
        const video = document.getElementById('video')
        const source = document.createElement('source')
        source.setAttribute('src', link)

        video.firstChild.remove()
        video.appendChild(source)
        video.load()
        video.play()
    }
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
}
