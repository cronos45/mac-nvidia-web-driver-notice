$(document).ready(function () {
  $.fn.serializeObject = function () {
    var o = {}
    var a = this.serializeArray()
    $.each(a, function () {
      if (o[this.name]) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]]
        }
        o[this.name].push(this.value || '')
      } else {
        o[this.name] = this.value || ''
      }
    })
    return o
  }

  function bytesToSize (bytes) {
    if (bytes === 0) return '0 B'
    const k = 1000 // or 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
  }

  function initTable (table, heads, reference) {
    heads = heads.map(function (item, index) {
      return {
        index: index,
        value: item
      }
    }).sort(function (a, b) {
      return reference[a.index] - reference[b.index]
    }).map(function (item) {
      return item.value
    })

    if (table.find('thead').length === 0) {
      table.append($('<thead></thead>').append('<tr></tr>'))
    }

    if (table.find('thead').find('tr').length === 0) {
      table.find('thead').append('<tr></tr>')
    }

    if (table.find('tbody').length === 0) {
      table.append($('<tbody></tbody>'))
    }

    $.each(heads, function (i, header) {
      table.find('thead').find('tr').append('<th>' + header + '</th>')
    })
  }

  function updateTable (table, arr, reference) {
    var tableRow = $('<tr></tr>')

    arr = arr.map(function (item, index) {
      return {
        index: index,
        value: item
      }
    }).sort(function (a, b) {
      return reference[a.index] - reference[b.index]
    }).map(function (item) {
      return item.value
    })

    $.each(arr, function (i, str) {
      if (i === 2) {
        tableRow.append($('<td>' + bytesToSize(str) + '</td>'))
      } else if (i === 4) {
        tableRow.append($("<td><a href='" + str + "' target='_blank'>" + str + '</a></td>'))
      } else {
        tableRow.append($('<td>' + str + '</td>'))
      }
    })

    table.append(tableRow)

    $(window).trigger('resize')
  }

  $.get('mac-update.php').done(function (val) {
    if (val.err) {
      alert(val.err)
    } else {
      var header = val.dict.array.dict[0].key
      header.splice(header.indexOf('OS'), 1)
      initTable($('#dataTable'), header, [5, 6, 4, 3, 1, 2])
      $.each(val.dict.array.dict, function (key, val) {
        updateTable($('#dataTable'), val.string, [5, 6, 4, 3, 1, 2])
      })
    }
    $('.loading').hide()
  }).fail(function (jqXHR, textStatus, errorThrown) {
    if (textStatus === 'timeout') {
      console.log('The server is not responding')
      alert('Please refresh and try again.')
      return
    }

    if (textStatus === 'error') {
      console.log(errorThrown)
    }

    alert('The server is not responding')
  })

  $('#submit').click(function () {
    $.ajax({
      type: 'POST',
      url: 'subscription.php',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify($('#form').serializeObject()),
      dataType: 'json',
      success: function (data) {
        if (data.status === 1) {
          alert('Got you, good luck!')
        } else if (data.status === 2) {
          alert("Don't worry, the information of your has been updated.")
        } else if (data.status === 3) {
          alert('Please enter at least one field.')
        } else {
          alert('Error, Please try again.')
        }
      },
      error: function () {
        alert('Network error, Please try again.')
      }
    })
  })
})