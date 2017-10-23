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
    var livretsIdTmp = null;
    $("#article-livretsid").on("keyup", function (event) {
        if (event.keyCode == 13) {  // Enter
            var livretsId = $(this).val().toUpperCase().trim();

            var ids = $.map($("#articles-table>tbody").find("td.livretsid"), function (element) {
                return element.innerText
            })
            console.log(ids.indexOf(livretsId))
            if (livretsId == null || livretsId === "" || ids.indexOf(livretsId) !== -1 || ids.indexOf(livretsId) !== 0)
                return
            
            $.ajax({
                method: "POST",
                url: "/Fair/OfferInfo",
                dataType: "json",
                data: {
                    LivrETSID: livretsId,
                    PickValidate: true
                },
                success: function (data, message, event) {
                    
                    if (event.status == 204)
                        return
                    
                    if (data.id == 0) {
                        $("#articles-table>tbody").html("")
                    } else {
                        var element = $("<tr>")
                        .append($("<td>").text(data.id).addClass("livretsid"))
                        .append($("<td>").text(data.articleTitle))
                        .append($("<td>").text(data.sellerFullName))
                        .append($("<td>").text(data.offerPrice))

                        $("#articles-table>tbody").append(element)

                        var ids = $.map($("#articles-table>tbody").find("td.livretsid"), function (element) {
                            return element.innerText
                        })
                        $.ajax({
                            method: "POST",
                            url: "/Fair/CalculatePrices",
                            dataType: "json",
                            data: {
                                LivrETSIDs: ids
                            },
                            success: function (data) {
                                $("#subtotal").val(data.subtotal)
                                $("#commission").val(data.commission)
                                $("#total").val(data.total)
                            },
                            statusCode: {
                                400: function (event, message) {
                                    $.notifyError("Un des identificateurs n'est pas valide.")
                                },
                                500: function (event, message) {
                                    $.notifyError("Une erreur est survenue. Svp réessayez.")
                                }
                            }
                        });
                    }
                    
                },
                statusCode: {
                    204: function (data, message, event) {
                        console.log(data)
                        $.notifyError(event.statusText)
                    },
                    400: function (event, message) {
                        $.notifyError(event.statusText)
                    },
                    500: function (event, message) {
                        $.notifyError("Une erreur est survenue. Svp réessayez.")
                    }
                }
            });
        }
    })
})