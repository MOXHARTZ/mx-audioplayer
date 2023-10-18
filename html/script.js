window.addEventListener('message', (event) => {
    const data = event.data;
    const type = data.type;
    if (type === 'open') {
        $('#container').fadeIn(200).css('display', 'flex');
    }
})

$(document).on('submit', '#container form', (e) => {
    e.preventDefault();
    const url = $('#container form input').val();
    if (!url) return;
    console.log(url);
    $.post('https://mx-boombox/play', JSON.stringify({ url }))
    $('#container').fadeOut(200);
    $('#container form input').val('');
})

// when onclick escape key
$(document).keyup(function (e) {
    if (e.key === "Escape") {
        $('#container').fadeOut(200);
        $('#container form input').val('');
        $.post('https://mx-boombox/close', JSON.stringify({}));
    }
})