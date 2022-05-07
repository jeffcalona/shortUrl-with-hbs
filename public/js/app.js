console.log("Hola js del frontend")

document.addEventListener('click', e => {
    if (e.target.dataset.short) {
        const url = `${window.location.origin}/${e.target.dataset.short}`
        navigator.clipboard.writeText(url).then(() => {
            console.log("Texto copiado en el Portapapel")
            console.log(url)
        }).catch((err) => {
            console.log("Algo salió mal", err)
        })
    }
})