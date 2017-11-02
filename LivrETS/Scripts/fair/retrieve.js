/**
LivrETS - Centralized system that manages selling of pre-owned ETS goods.
Copyright (C) 2016  TribuTerre

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>
**/


$(document).ready(function () {
    var table = null;
    

    $("#btn-reinitialize").on("click", function () {
        window.location.reload(true)
    });
    $("#in-barcode").focus();

    $("#btn-retrieve").on("click", function () {
        var price = 0;
        var ids = $.map($("#articles-table").find(".article-livretsid"), function (element) {
            if ($(element).parents("tr").find(".article-livretsstatus").text() == "vendu") {
                return element.innerText.toUpperCase().trim();
            }  
        });

        if (ids.length == 0) {
            $.notifyError("Aucun article à récupérer");
            return;
        }

        $.ajax({
            method: "POST",
            url: "/Fair/RetrievePrice",
            dataType: "json",
            data: {
                ids: ids,
                price: parseFloat($("#retreiveprice").text())
            },
            success: function (data) {
                if (data.status == 1) {
                    $("#retreiveprice").css("color", "green");
                    $("#give-price").find("h4").html("(Remis)")
                }
                    
                $.notifySuccess(data.message);
            },
            statusCode: {
                500: function () {
                    $.notifyError("Une erreur est survenue. Svp réessayer.")
                }
            }
        });
    });


    $("#in-barcode").on("keyup", function (event) {
        if (event.keyCode == 13) {  // Enter
            
            var barCode = $(this).val().toUpperCase().trim()
            var totalPrice = 0;
            var $tbody = $("#articles-table>tbody");

            if (barCode === "")
                return

            $.fn.dataTable.ext.errMode = 'none';

            $('#articles-table').on('error.dt', function (e, settings, techNote, message) {
                    $.notifyError("Une erreur est survenu. Recommencez sinon contactez un administrateur.")
            }).DataTable();

            //load table offers
            table = $('#articles-table').DataTable({
                createdRow: function (row, data, index) {
                    $("#retreiveprice").text("0");
                    if (data.sold) {
                        var pricedisplay = parseFloat($("#retreiveprice").text());
                        var price = parseFloat($('td', row).eq(3).text());

                        var totalPrice = pricedisplay + price;
                        $("#retreiveprice").text(totalPrice.toFixed(2));
                    } 
                    
                },
                fnInitComplete: function (oSettings, json) {
                    /*var btnClear = $('<button class="btn btn-sm btn-success btnClearDataTableFilter">Reset</button>');
                    btnClear.appendTo($('#' + oSettings.sTableId).parents('.dataTables_wrapper').find('.dataTables_filter'));*/
                    $('#' + oSettings.sTableId + '_wrapper .btnClearDataTableFilter').click(function () {
                        $('#' + oSettings.sTableId).dataTable().fnFilter('');
                    });
                    $("#dataTables_filter").css("margin-right", "70%");
                },
                scrollY: "500px",
                scrollCollapse: true,
                paging: false,
                destroy: true,
                processing: true,
                error: function (oSettings, json) {
                    $.notifyError("Aucun utilisateur avec ce code");
                },
                language: {
                    search: " "
                },
                dom: 't',
                ajax: {
                    url: "/Fair/OffersNotSold",
                    type: "POST",
                    dataType: "JSON",
                    data: { UserBarCode: barCode },
                    dataSrc: function (val) {
                        return val
                    }
                },
                columns: [
                    {
                        "class": "article-livretsid",
                        data: function (val) {
                            return val.id;
                        }
                    },
                    {
                        searchable: false,
                        data: function (val) {
                            return val.title;
                        }
                    },
                    {
                        searchable: false,
                        data: function (val) {
                            return val.userFullName;
                        }
                    },
                    {
                        searchable: false,
                        data: function (val) {
                            return val.price;
                        }
                    },
                    {
                        searchable: false,
                        "class": "article-livretsstatus",
                        data: function (val, row) {
                            //le focus est place ici car, il faut s'assurer que la table est remplit 
                            //avant de le deplacer
                            $("#article-search").focus();
                            if (val.sold) {
                                return "<b class='text-success'>vendu</b>";
                            }

                            return "<b class='text-danger'>non vendu</b>";
                        }
                    }
                ]


            }); 
        }
    });

    $("#article-search").on("keyup", function (e) {
        if (e.keyCode == 13) {  // Enter
            var dataSearch = $(this).val();
            var tabDataSearch = dataSearch.split('-');

            if (dataSearch != "" && tabDataSearch.length == 3) {
                table.search(dataSearch).draw();

                $.ajax({
                    method: "POST",
                    url: "/Fair/RetrieveArticles",
                    dataType: "json",
                    data: {
                        id: dataSearch
                    },
                    success: function (data) {
                        if (data.status == 1){
                            if(data.warning == 1)
                                $.notifyWarning(data.message);
                            else
                                $.notifySuccess(data.message);
                        }
                            
                        else
                            $.notifyError(data.message);
                    },
                    statusCode: {
                        500: function () {
                            $.notifyError("Une erreur est survenue. Svp réessayer.")
                        }
                    }
                });
            } else
                $.notifyError("Erreur numéro d'étiquette");
            
        }
    });

});
