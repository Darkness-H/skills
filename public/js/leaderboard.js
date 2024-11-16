function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => {
            resolve(image);
        });
        image.addEventListener('error', (err) => {
            reject(new Error(`Error al cargar la imagen ${url}`));
        });
        image.src = url;
    });
}

const gestionarEventos = () => {
    fetch('../js/scripts/badges.json')
        .then(response => response.json()) // Convierte la respuesta en JSON
        .then(data => {
            //const data = require('./badges.json');
            const tableBody = document.getElementById('rangeBody');

            data.forEach(elem => {
                const row = document.createElement('tr');

                const nameCell = document.createElement('td');
                nameCell.textContent = elem.rango;
                row.appendChild(nameCell);

                const imgCell = document.createElement('td');

                loadImage(`../badges/${elem.png}`)
                    .then(img => {
                        imgCell.appendChild(img);
                        }).catch(err => console.error(err));;
                row.appendChild(imgCell);

                const pointsCell = document.createElement('td');
                pointsCell.textContent = `${elem.bitpoints_min} - ${elem.bitpoints_max}`;
                row.appendChild(pointsCell);

                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error al cargar el JSON:', error));
}
window.onload = gestionarEventos;