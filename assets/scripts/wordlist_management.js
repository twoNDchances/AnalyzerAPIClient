import { checker, notificator, callAPI } from "./general.js";

checker()

$(document).ready(function () {
    callAPI(
        'GET',
        '/api/wordlists/list',
        function () {
            $('#wordlistManagement').empty().append(`
                <div class="small-item-center">
                    <div class="loader"></div>
                </div>
            `)
        },
        function (data) {
            const responseData = JSON.parse(data.responseText)
            console.log(responseData);
            $('#wordlistManagement').empty().append(`
                <table class="mb-0 table table-striped">
                    <thead>
                        <tr>
                            <th class="text-center">Wordlist Name</th>
                            <th class="text-center">Count</th>
                            <th class="text-center">Wordlist Details</th>
                            <th class="text-center">Delete</th>
                        </tr>
                    </thead>
                    <tbody id="wordlistManagementTable">
                    </tbody>
                </table>
            `)
            for (let index = 0; index < responseData.data.length; index++) {
                const element = responseData.data[index];
                $('#wordlistManagementTable').append(`
                    <tr id="wordlistRow_${element.wordlist_name}">
                        <th class="text-center">${element.wordlist_name}</th>
                        <th class="text-center text-success"><strong>${element.count}</strong></th>
                        <th class="text-center">
                            <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#wordlistDetailsModal" data-wordlist-name="${element.wordlist_name}" onclick=getWordlistDetails(this)>
                                <i class="fa fa-eye"></i>
                            </button>
                        </th>
                        <th class="text-center">
                            <button class="mb-2 mr-2 btn btn-danger" data-toggle="modal" data-target="#wordlistDeleteModal" data-wordlist-name="${element.wordlist_name}" onclick=deleteWordlist(this)>
                                <i class="fa fa-trash"></i>
                            </button>
                        </th>
                    </tr>
                `)
            }
        },
        function (error) {
            if (error.status == 404) {
                $('#wordlistManagement').empty().append(`
                    <div class="item-center">
                        <p>Empty</p>
                    </div>
                `)
            }
            else {
                notificator('Error', 'Can\'t fetch wordlists from Analyzer backend', 'error')
                $('#wordlistManagement').empty().append(`
                    <div class="item-center">
                        <p>Error</p>
                    </div>
                `)
            }
        }
    )

    $('#updateButton').on('click', function () {
        let isWordlistNameErrorField = false;
        let isContentErrorField = false;
        if (String($('#wordlistName').val()).length == 0) {
            isWordlistNameErrorField = true
        }
        if (String($('#content').val()).length == 0) {
            isContentErrorField = true
        }
        if (isWordlistNameErrorField == true || isContentErrorField == true) {
            if (isWordlistNameErrorField == true) {
                $('#wordlistNameErrorField').empty().append(`<p class="error-text">Wordlist Name is required</p>`)
            }
            if (isContentErrorField == true) {
                $('#contentErrorField').empty().append(`<p class="error-text">Content is required</p>`)
            }
            notificator('Error', 'Form validation fail!', 'error');
            return
        }
        const formData = {
            wordlistName: $('#wordlistName').val(),
            content: $('#content').val().split('\n')
        }
        const wordlistName = document.getElementById('updateButton').getAttribute('data-wordlist-name')
        callAPI(
            'PUT',
            '/api/wordlists/update/' + wordlistName,
            function () {
                $('#updateButton').empty().append(`
                    <div class="small-item-center">
                        <div class="loader"></div>
                    </div>
                `).attr('disabled', true)
            },
            function (data) {
                $('#updateButton').empty().text('Update').removeAttr('disabled')
                $('#wordlistDetailsModalCloseButton').click()
                const responseData = JSON.parse(data.responseText)
                $(`#wordlistRow_${wordlistName}`).empty().append(`
                    <th class="text-center">${responseData.data.wordlist_name}</th>
                    <th class="text-center text-success"><strong>${responseData.data.count}</strong></th>
                    <th class="text-center">
                        <button class="mb-2 mr-2 btn btn-light" data-toggle="modal" data-target="#wordlistDetailsModal" data-wordlist-name="${responseData.data.wordlist_name}" onclick=getWordlistDetails(this)>
                            <i class="fa fa-eye"></i>
                        </button>
                    </th>
                    <th class="text-center">
                        <button class="mb-2 mr-2 btn btn-danger" data-toggle="modal" data-target="#wordlistDeleteModal" data-wordlist-name="${responseData.data.wordlist_name}" onclick=deleteWordlist(this)>
                            <i class="fa fa-trash"></i>
                        </button>
                    </th>
                `)
            },
            function (error) {
                $('#updateButton').empty().text('Update').removeAttr('disabled')
                const responseError = JSON.parse(error.responseText)
                notificator('Error', responseError, 'error')
            },
            JSON.stringify(formData)
        )
    })

    $('#deleteButton').on('click', function () {
        const wordlistName = document.getElementById('deleteButton').getAttribute('data-wordlist-name')
        callAPI(
            'DELETE',
            '/api/wordlists/delete/' + wordlistName,
            function () {
                $('#deleteButton').empty().append(`
                    <div class="small-item-center">
                        <div class="loader"></div>
                    </div>
                `).attr('disabled', true)
            },
            function (data) {
                $('#deleteButton').empty().text('Delete').removeAttr('disabled')
                $('#wordlistDeleteModalCloseButton').click()
                $(`#wordlistRow_${wordlistName}`).remove()
            },
            function (error) {
                $('#deleteButton').empty().text('Delete').removeAttr('disabled')
                const responseError = JSON.parse(error.responseText)
                notificator('Error', responseError, 'error')
            }
        )
    })
})