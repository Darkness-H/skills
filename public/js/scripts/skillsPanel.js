// skillsPanel.js
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('svg-container');

    fetch('/js/scripts/skills.json')
        .then(response => response.json())
        .then(skills => {
            console.log(skills) //verificamos que los datos se cargan correctamente
            skills.forEach(skill => {
                const wrapper = document.createElement('div');
                wrapper.classList.add('svg-wrapper');
                wrapper.dataset.id = skill.id;
                wrapper.dataset.custom = 'false';

                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("width", "100");
                svg.setAttribute("height", "100");
                svg.setAttribute("viewBox", "0 0 100 100");

                const hexagon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                hexagon.setAttribute("points", "50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5");
                hexagon.classList.add('hexagon');
                svg.appendChild(hexagon);

                // Añadir eventos de mouseover y mouseout
                wrapper.addEventListener('mouseover', () => {
                    svg.style.transform = 'scale(1.2)';
                    pencilIcon.style.display = 'block';
                    notebookIcon.style.display = 'block';
                });

                wrapper.addEventListener('mouseout', () => {
                    svg.style.transform = 'scale(1)';
                    pencilIcon.style.display = 'none';
                    notebookIcon.style.display = 'none';
                });

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", "50%");
                text.setAttribute("y", "20%");
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("fill", "black");
                text.setAttribute("font-size", "10"); // Tamaño de fuente más pequeño

                const maxLineLength = 32;
                const words = skill.text.split(' ');
                let currentLine = '';

                words.forEach((word, index) => {
                    // Verificamos si agregar la palabra actual excede la longitud máxima
                    if (currentLine.length + word.length + 1 <= maxLineLength) {
                        currentLine += word + ' ';
                    } else {
                        // Crea una nueva línea para el tspan
                        const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                        tspan.setAttribute("x", "50%");
                        tspan.setAttribute("dy", "1.2em");
                        tspan.setAttribute("font-weight", "bold");
                        tspan.textContent = currentLine.trim();
                        text.appendChild(tspan);


                        currentLine = word + ' ';
                    }
                });

                // Agregar la última línea si hay texto restante
                if (currentLine) {
                    const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                    tspan.setAttribute("x", "50%");
                    tspan.setAttribute("dy", "1.2em");
                    tspan.setAttribute("font-weight", "bold");
                    tspan.textContent = currentLine.trim();
                    text.appendChild(tspan);
                }


                svg.appendChild(text);


                const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
                image.setAttribute("x", "35%");
                image.setAttribute("y", "60%");
                image.setAttribute("width", "30");
                image.setAttribute("height", "30");
                image.setAttribute("href", `/electronics/icons/${skill.icon}`);
                svg.appendChild(image);

                // Crear iconos de lápiz y cuaderno usando emojis
                const pencilIcon = document.createElement('div');
                pencilIcon.style.position = 'absolute';
                pencilIcon.style.left = '0%';
                pencilIcon.style.bottom = '0%';
                pencilIcon.style.fontSize = '20px';
                pencilIcon.style.display = 'none';
                pencilIcon.style.zIndex = '10';
                pencilIcon.style.transform = 'rotate(270deg)';
                pencilIcon.textContent = '✏️';
                wrapper.appendChild(pencilIcon);

                const notebookIcon = document.createElement('div');
                notebookIcon.style.position = 'absolute';
                notebookIcon.style.right = '0%';
                notebookIcon.style.bottom = '0%';
                notebookIcon.style.fontSize = '20px';
                notebookIcon.style.display = 'none';
                notebookIcon.style.zIndex = '10';
                notebookIcon.textContent = '📓';
                wrapper.appendChild(notebookIcon);

                wrapper.appendChild(svg);
                container.appendChild(wrapper);
            });
        })
        .catch(error => console.error('Error al cargar skills.json:', error));
});
