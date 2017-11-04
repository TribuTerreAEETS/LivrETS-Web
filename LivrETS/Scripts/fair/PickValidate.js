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

            if (livretsId == null || livretsId === "")
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
                    console.log($("#articles-table>tbody tr th").length)
                    if (data.id == 0) {
                        if(($("#articles-table>tbody tr").length + 1) > 1)
                            $("#articles-table>tbody tr:last-child()").remove();
                        else
                            $("#articles-table>tbody").html("");

                        $.notifyWarning("Article non ceuillit");
                    } else {
                        var element = $("<tr id='" + data.id + "'>")
                        .append($("<td>").text(data.id).addClass("livretsid"))
                        .append($("<td>").text(data.articleTitle))
                        .append($("<td>").text(data.sellerFullName))
                        .append($("<td>").text(data.offerPrice));

                        $("#articles-table>tbody").append(element);

                        $.notifySuccess("Article ceuillit");
                    }
                    
                },
                statusCode: {
                    204: function (data, message, event) {
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