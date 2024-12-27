function main() {

    const currentSkill = "skill0";

    ///////////////////////////////////////////////////////////////////////////////////////
    // Simulamos que ya tenemos los datos de las evidencias enviadas del skill0 (BACK-END)
    const storedEvidence = [
        {
            "id": "0",
            "user": "Admin",
            "evidence": "Evidencia 1",
            "status": "Rejected"
        },
        {
            "id": "1",
            "user": "Admin",
            "evidence": "Evidencia 2",
            "status": "Approved"
        },
        {
            "id": "2",
            "user": "User1",
            "evidence": "Evidencia 3",
            "status": "Approved"
        },
        {
            "id": "3",
            "user": "User2",
            "evidence": "Evidencia 4",
            "status": "Approved"
        },
        {
            "id": "4",
            "user": "User3",
            "evidence": "Evidencia 5",
            "status": "Unverified"
        }
    ]
    localStorage.setItem(currentSkill, JSON.stringify(storedEvidence));
    ///////////////////////////////////////////////////////////////////////////////////////

    const interval = setInterval(() => {
        const mainDiv = document.querySelector('.svg-wrapper[data-id="1"]');
        if (mainDiv) { // Elemento encontrado
            clearInterval(interval); // Detiene la búsqueda

            const storedEvidence = JSON.parse(localStorage.getItem(currentSkill)) || [];

            if (storedEvidence.length > 0) {

                let numberSubVer = storedEvidence.reduce((jsonData, evidence) => {
                    let stat = evidence.status;

                    if (jsonData[stat]) {
                        jsonData[stat] += 1;
                    } else {
                        jsonData[stat] = 1;
                    }

                    return jsonData;
                }, {});

                let adminApproved = storedEvidence.filter(evidence => evidence.status === "Approved" && evidence.user === "Admin").length;
                let userApproved = storedEvidence.filter(evidence => evidence.status === "Approved" && evidence.user !== "Admin").length;

                if (adminApproved > 0) {
                    const attachedCircle = document.createElement("div");
                    attachedCircle.className = "circle-indicator green";
                    attachedCircle.textContent = (numberSubVer["Approved"] || 0).toString();
                    attachedCircle.style.top = "-7px";
                    attachedCircle.style.right = "5px";
                    mainDiv.appendChild(attachedCircle);
                    const polygon = mainDiv.querySelector(".hexagon");
                    polygon.style.fill = "#28a745"; // Verde
                }
                else if (userApproved >= 3) {
                    const attachedCircle = document.createElement("div");
                    attachedCircle.className = "circle-indicator green";
                    attachedCircle.textContent = (numberSubVer["Approved"] || 0).toString();
                    attachedCircle.style.top = "-7px";
                    attachedCircle.style.right = "5px";
                    mainDiv.appendChild(attachedCircle);
                    const polygon = mainDiv.querySelector(".hexagon");
                    polygon.style.fill = "#28a745"; // Verde
                }
                else {
                    const polygon = mainDiv.querySelector(".hexagon");
                    polygon.style.fill = "#ffffff"; // Blanco por defecto
                }

                let redCircle = numberSubVer["Unverified"] || 0;
                if (redCircle !== 0) {

                    const attachedCircle = document.createElement("div");
                    attachedCircle.className = "circle-indicator red";
                    attachedCircle.textContent = redCircle.toString();
                    attachedCircle.style.top = "-7px";
                    attachedCircle.style.right = "75px";
                    mainDiv.appendChild(attachedCircle);
                }
            }

        }
    }, 100); // Verifica cada 100 ms
}

// Función para actualizar el estado de la evidencia en localStorage
function saveEvidenceToLocalStorage(currentSkill, evidenceId, status) {
    const storedEvidence = JSON.parse(localStorage.getItem(currentSkill)) || [];
    const evidence = storedEvidence.find(e => e.id === evidenceId);

    if (evidence) {
        evidence.status = status;
        localStorage.setItem(currentSkill, JSON.stringify(storedEvidence));
        main(); // Actualizamos la visualización
    }
}

// Función para actualizar la visualización del skill cuando se aprueba o rechaza una evidencia
function approveOrRejectEvidence(evidenceId, action) {
    const currentSkill = "skill0";

    // Primero actualizamos el estado en localStorage
    saveEvidenceToLocalStorage(currentSkill, evidenceId, action);

    // Ahora, actualizamos los círculos
    const storedEvidence = JSON.parse(localStorage.getItem(currentSkill)) || [];
    let redCircle = storedEvidence.filter(e => e.status === "Unverified").length;
    let greenCircle = storedEvidence.filter(e => e.status === "Approved").length;

    // Si se aprobó o rechazó una comprobación pendiente, se actualizan los círculos
    if (action === "Approved") {
        greenCircle += 1; // Añadir al círculo verde
    } else if (action === "Rejected") {
        redCircle -= 1; // Quitar del círculo rojo
    }

    // Actualizamos los círculos en la interfaz
    updateCircles(greenCircle, redCircle);
}

// Función para actualizar los círculos en la interfaz
function updateCircles(greenCircle, redCircle) {
    const mainDiv = document.querySelector('.svg-wrapper[data-id="1"]');
    if (mainDiv) {
        let greenIndicator = mainDiv.querySelector(".circle-indicator.green");
        let redIndicator = mainDiv.querySelector(".circle-indicator.red");

        // Actualizamos el círculo verde
        if (greenIndicator) {
            greenIndicator.textContent = greenCircle.toString();
        } else {
            const newGreenCircle = document.createElement("div");
            newGreenCircle.className = "circle-indicator green";
            newGreenCircle.textContent = greenCircle.toString();
            newGreenCircle.style.top = "-7px";
            newGreenCircle.style.right = "5px";
            mainDiv.appendChild(newGreenCircle);
        }

        // Actualizamos el círculo rojo
        if (redIndicator) {
            redIndicator.textContent = redCircle.toString();
        } else {
            const newRedCircle = document.createElement("div");
            newRedCircle.className = "circle-indicator red";
            newRedCircle.textContent = redCircle.toString();
            newRedCircle.style.top = "-7px";
            newRedCircle.style.right = "75px";
            mainDiv.appendChild(newRedCircle);
        }
    }
}

// Llamar a la función principal cuando se cargue la página
window.onload = main;
