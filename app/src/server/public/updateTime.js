window.onload = function () {
    setInterval(() => {
        fetch('/api/uptime/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json()).then(data => {
            document.getElementById('uptime-value').innerHTML = data.uptime;
        });
    }, 1000);
}
