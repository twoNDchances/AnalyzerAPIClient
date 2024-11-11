export function checker() {
    const apiURL = getCookie('backendAPI')
    if (!apiURL) {
        // notificator('Error', 'Can\'t connect to Analyzer backend', 'error')
        location.href = 'configuration.html'
    }
}

export function notificator(title, message, type) {
    toastr.options.closeMethod = 'fadeOut';
    toastr.options.closeDuration = 300;
    toastr.options.closeEasing = 'swing';
    toastr.options.timeOut = 5000;
    toastr.options.showMethod = 'slideDown';
    toastr.options.hideMethod = 'slideUp';
    toastr.options.preventDuplicates = true;
    if (type == 'info') {
        toastr.info(message, title);
    }
    if (type == 'success') {
        toastr.success(message, title);
    }
    if (type == 'warning') {
        toastr.warning(message, title);
    }
    if (type == 'error') {
        toastr.error(message, title);
    }
}

export function setCookie(name, value, days) {
    let expires = ""
    if (days) {
        const date = new Date()
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
        expires = "; expires=" + date.toUTCString()
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/"
}

export function convertFormToJSON(formData) {
    const jsonData = {}
    formData.forEach((value, key) => {
        jsonData[key] = value;
    })

    return JSON.stringify(jsonData)
}

export function getCookie(name) {
    const nameEQ = name + "="
    const cookiesArray = document.cookie.split(';')
    for (let i = 0; i < cookiesArray.length; i++) {
        let cookie = cookiesArray[i]
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length)
        }
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length))
        }
    }
    return null;
}

export function callAPI(method, endpoint, onLoading, onSuccess, onError, body = null) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 0 || this.readyState == 1 || this.readyState == 2 || this.readyState == 3) {
            onLoading()
        }
        else if (this.readyState == 4 && this.status == 200) {
            onSuccess(this)
        }
        else if (this.status != 200) {
            onError(this)
        }
    }
    xhr.open(method, getCookie('backendAPI') + endpoint);
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.timeout = 5000
    if (body == null) {
        xhr.send();
    }
    else {
        xhr.send(body);
    }
}

export async function fetchData(endpoint, method = 'GET', body = null, onLoading, onSuccess, onError) {
    if (onLoading) onLoading();

    try {
        const options = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(getCookie('backendAPI') + endpoint, options);

        if (!response.ok) {
            if (onError) onError(response.status, `Error: ${response.statusText}`);
            return;
        }

        const data = await response.json();

        if (onSuccess) onSuccess(data);
    } catch (error) {
        if (onError) onError(null, `Network error: ${error.message}`);
    }
}

