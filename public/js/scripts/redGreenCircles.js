function main() {

    const currentSkill = "skill0";

    ///////////////////////////////////////////////////////////////////////////////////////
    // Simulamos que ya tenemos los datos de las evidencias enviadas del skill0 (BACK-END)
    const storedEvidence = [
        {
            "id": "0",
            "user": "Admin",
            "evidence": "Evidencia 1",
            "status": "Approved" // Si este valor fuera Rejected -> círculo rojo
        },
        {
            "id": "1",
            "user": "Admin",
            "evidence": "Evidencia 2",
            "status": "Rejected"
        },
        {
            "id": "2",
            "user": "Admin",
            "evidence": "",
            "status": "Unverified"
        }
    ]
    localStorage.setItem(currentSkill, JSON.stringify(storedEvidence));
    ///////////////////////////////////////////////////////////////////////////////////////

    //const storedEvidence = JSON.parse(localStorage.getItem(currentSkill)) || [];

    // Los elementos .svg-wrapper se crean dinámicamente
    // Usamos setInterval para verificar periódicamente si el elemento ya está en el DOM
    const interval = setInterval(() => {
        const mainDiv = document.querySelector('.svg-wrapper[data-id="1"]');
        if (mainDiv) { // Elemento encontrado
            clearInterval(interval); // Detiene la búsqueda

            if (storedEvidence.length > 0) {

                let numberSubVer = storedEvidence.reduce((jsonData, evidence) => {
                    let stat = evidence.status;

                    // If the status exists in jsonData, increment it; otherwise, initialize it to 1
                    if (jsonData[stat]) {
                        jsonData[stat] += 1;
                    } else {
                        jsonData[stat] = 1;
                    }

                    return jsonData;
                }, {});

                // Green circle (number of verifications)
                let greenCircle = numberSubVer["Approved"] || 0;
                if (greenCircle !== 0) {
                    greenCircle += numberSubVer["Rejected"] || 0

                    // Remove the attached red circle if it exists
                    let element = document.querySelector(".circle-indicator.red");
                    if (element) {
                        element.remove();
                    }

                    // Create the small attached circle
                    const attachedCircle = document.createElement("div");
                    attachedCircle.className = "circle-indicator green"; // Assign the class for styling

                    // Optional text inside the circle (like a number)
                    attachedCircle.textContent = greenCircle.toString();

                    // Position the small circle exactly at the upper-right corner
                    attachedCircle.style.top = "-7px"; // Attach at the top
                    attachedCircle.style.right = "5px"; // Attach to the right

                    // Attach the small circle to the main div
                    mainDiv.appendChild(attachedCircle);

                    // Paint the polygon
                    const polygon = mainDiv.querySelector(".hexagon");
                    polygon.style.fill = "#28a745"; // Cambia el color a verde

                } else {
                    // Red circle (number of submissions waiting verification)
                    let redCircle = numberSubVer["Unverified"] || 0;
                    if(redCircle !== 0) {

                        // Create the small attached circle
                        const attachedCircle = document.createElement("div");
                        attachedCircle.className = "circle-indicator red"; // Assign the class for styling

                        // Optional text inside the circle (like a number)
                        attachedCircle.textContent = redCircle.toString();

                        // Position the small circle exactly at the upper-left corner
                        attachedCircle.style.top = "-7px"; // Attach at the top
                        attachedCircle.style.right = "75px"; // Attach to the right

                        // Attach the small circle to the main div
                        mainDiv.appendChild(attachedCircle);

                    }
                }

            }

        }
    }, 100); // Verifica cada 100 ms

}

window.onload = main;