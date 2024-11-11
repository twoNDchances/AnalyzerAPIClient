import { notificator, setCookie } from "./general.js";

$(document).ready(function () {
    $('#connectionButton').on('click', function (event) {
        event.preventDefault()
        let analyzer = String(document.getElementById('analyzerURL').value)
        if (analyzer.length == 0) {            
            analyzer = 'http://localhost:9947'
        }
        else {            
            analyzer = analyzer.replace(/\/$/, "")
        }
        let xhr = new XMLHttpRequest()
        xhr.timeout = 3000
        xhr.onreadystatechange = function () {
            if (this.readyState == 0 || this.readyState == 1 || this.readyState == 2 || this.readyState == 3) {
                $('#connectionButton').empty().append(`<div class="loader"></div>`).attr('disabled', true)
                
            }
            else if (this.readyState == 4 && this.status == 200) {                
                notificator('Success', 'Connect successfully', 'success')
                setCookie('backendAPI', analyzer)
                setTimeout(function () {
                    location.href = 'rule_management.html'
                }, 1000)
            }
            else {                
                $('#connectionButton').empty().text('Connect').removeAttr('disabled')
                notificator('Error', 'Can\'t connect to Analyzer backend!', 'error')
            }
        }        
        xhr.open('GET', analyzer);
        xhr.send();
    })
})