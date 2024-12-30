// Function to create the title "Unverified Evidence Submissions"
function createTitle() {
    const formContainer = document.getElementById("form-container");
    let title = document.createElement("h3");
    title.id = "eviTable-title";
    title.textContent = "Unverified Evidence Submissions";
    title.style.textAlign = "left";

    // Insertarlo justo debajo de formContainer
    formContainer.insertAdjacentElement("afterend", title);
}

// Function to create the table of evidences
function createTable() {
    const unSubTitle = document.getElementById("eviTable-title");
    let table = document.createElement("table");
    table.id = "unverified-evidence";
    table.classList.add("styled-table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["User", "Evidence", "Actions"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);
    table.appendChild(document.createElement("tbody"));
    // Insertarlo justo debajo de "Unverified Evidence Submissions"
    unSubTitle.insertAdjacentElement("afterend", table);
}

// Función para hacer el POST de la evidencia
function submitEvidence() {
    const evidenceTextarea = document.getElementById("evidence_text");
    const evidence = evidenceTextarea.value;

    // POST request to submit the evidence
    fetch(`/skills/${skillTreeName}/submit-evidence`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({evidence: evidence, skillId: skillId, userSkillId: userSkillId})
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Clear the textarea
            evidenceTextarea.value = "";
        })
        .catch(error => {
            console.error("Error submitting evidence:", error);
        });
}





// Function to create "Approve" and "Reject" buttons for a given evidence
function createApproveRejectButtons(actionCell, currentSkill, row) {
    const approveButton = document.createElement("button");
    const rejectButton = document.createElement("button");

    // "Approve" button
    approveButton.textContent = "Approve";
    approveButton.classList.add("verify-button");
    approveButton.addEventListener("click", () => {
        actionCell.innerHTML = '';
        const approvedMessage = document.createElement("span");
        approvedMessage.innerHTML = "<strong style='color: #28a745;'>Approved</strong>";
        actionCell.appendChild(approvedMessage);
        saveEvidenceToLocalStorage(currentSkill, row, "Approved");
    });

    // Change the button color on hover
    approveButton.addEventListener("mouseover", () => {
        approveButton.style.backgroundColor = "#218838"; // Darker green on hover
    });
    approveButton.addEventListener("mouseout", () => {
        approveButton.style.backgroundColor = "#28a745"; // Original green color
    });

    // "Reject" button
    rejectButton.textContent = "Reject";
    rejectButton.classList.add("reject-button");
    rejectButton.addEventListener("click", () => {
        actionCell.innerHTML = '';
        const rejectedMessage = document.createElement("span");
        rejectedMessage.innerHTML = "<strong style='color: #dc3545;'>Rejected</strong>";
        actionCell.appendChild(rejectedMessage);
        saveEvidenceToLocalStorage(currentSkill, row, "Rejected");
    });

    // Change the button color on hover
    rejectButton.addEventListener("mouseover", () => {
        rejectButton.style.backgroundColor = "#c0392b"; // Darker red on hover
    });
    rejectButton.addEventListener("mouseout", () => {
        rejectButton.style.backgroundColor = "#dc3545"; // Original green color
    });

    actionCell.appendChild(approveButton);
    actionCell.appendChild(rejectButton);
}

// Function to load evidence for the specific skill from localStorage
function loadEvidenceFromLocalStorage(currentSkill) {

    const storedEvidence = JSON.parse(localStorage.getItem(currentSkill)) || [];
    if (storedEvidence.length > 0) {
        createTitle();
        createTable();
        let table = document.getElementById("unverified-evidence");

        const tbody = table.querySelector("tbody");

        // Iterate over the stored evidence and populate the table
        storedEvidence.forEach(data => {
            const row = document.createElement("tr");
            row.setAttribute("data-id", data.id);

            // User cell
            const userCell = document.createElement("td");
            userCell.textContent = data.user;

            // Evidence cell
            const evidenceCell = document.createElement("td");
            evidenceCell.textContent = data.evidence;

            // Action cell with status message
            const actionCell = document.createElement("td");
            const statusMessage = document.createElement("span");

            if (data.status === "Approved") {
                statusMessage.innerHTML = "<strong style='color: #28a745;'>Approved</strong>";
                actionCell.appendChild(statusMessage);
            } else if (data.status === "Rejected") {
                statusMessage.innerHTML = "<strong style='color: #dc3545;'>Rejected</strong>";
                actionCell.appendChild(statusMessage);
            } else {
                // Create "Approve" and "Reject" buttons for the unverified evidence
                createApproveRejectButtons(actionCell, currentSkill, row);
            }

            row.appendChild(userCell);
            row.appendChild(evidenceCell);
            row.appendChild(actionCell);

            // Append the row to tbody
            tbody.appendChild(row);
        });
    }

}

function main() {

    const checkboxes = document.querySelectorAll(".task-checkbox");

    const usuarioActual = "Admin";
    const currentSkill = "skill0";

    function checkAllCompleted() {
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);

        // Assuming "allChecked" is a boolean indicating if all checkboxes are checked
        if (allChecked) {

            // Lanzar la animación de confetti
            showConfetti();

            // Cargar la tabla de Evidencias (si existe)
            loadEvidenceFromLocalStorage(currentSkill); // Esto lo cargamos en el GET

            const formContainer = document.getElementById("form-container");
            formContainer.innerHTML = ''; // Clear any previous content

            // Create the form
            const form = document.createElement("form");

            // Create the title for the form
            const formTitle = document.createElement("h3");
            formTitle.textContent = "Provide Evidence";
            form.appendChild(formTitle);

            // Create the textarea for evidence input (make it occupy full width, non-resizable)
            const evidenceTextarea = document.createElement("textarea");
            evidenceTextarea.name = "evidence_text";
            evidenceTextarea.id = "evidence_text";
            evidenceTextarea.required = true;
            evidenceTextarea.placeholder = "Enter a URL or explanation as evidence for completing this skill";
            evidenceTextarea.rows = 8;  // Set the number of visible rows for the text area
            evidenceTextarea.style.width = "100%";  // Make the textarea take up the full width of the container
            evidenceTextarea.style.resize = "none";  // Prevent the textarea from being resized
            form.appendChild(evidenceTextarea);

            // Add some space between the textarea and the submit button
            const marginDiv = document.createElement("div");
            marginDiv.style.margin = "20px 0"; // Add a margin to create space
            form.appendChild(marginDiv); // Add the marginDiv between the textarea and button

            // Create the submit button and style it as green, smaller
            const submitButton = document.createElement("button");
            submitButton.type = "submit";
            submitButton.textContent = "Submit Evidence";
            submitButton.style.backgroundColor = "#28a745"; // Green color
            submitButton.style.color = "white"; // Text color white
            submitButton.style.padding = "8px 16px"; // Smaller padding to make the button smaller
            submitButton.style.border = "none"; // Remove the default border
            submitButton.style.borderRadius = "4px"; // Rounded corners
            submitButton.style.cursor = "pointer"; // Pointer cursor on hover
            submitButton.style.width = "auto"; // Set the width to auto for a smaller button

            // Add a wrapper div to center the button
            const buttonWrapper = document.createElement("div");
            buttonWrapper.style.display = "flex"; // Use flexbox to center the button
            buttonWrapper.style.justifyContent = "center"; // Horizontally center the button
            buttonWrapper.appendChild(submitButton); // Append the button to the wrapper div

            // Change the button color on hover
            submitButton.addEventListener("mouseover", () => {
                submitButton.style.backgroundColor = "#218838"; // Darker green on hover
            });
            submitButton.addEventListener("mouseout", () => {
                submitButton.style.backgroundColor = "#28a745"; // Original green color
            });

            // Submit the evidence
            submitButton.addEventListener("click", (event) => { // Usar POST para enviar la evidencia
                event.preventDefault();

                const texto = evidenceTextarea.value;

                // Asign a numeric id for each row of evidence
                let storedData = JSON.parse(localStorage.getItem(currentSkill)) || [];
                const rowId = storedData.length;

                // Check if the title already exists
                let title = document.getElementById("eviTable-title");
                if (!title) {
                    createTitle();
                }

                // Check if the table exists
                let table = document.getElementById("unverified-evidence");
                if (!table) {
                    createTable();
                    table = document.getElementById("unverified-evidence");
                }

                // Add a new row with the user's evidence data
                const tbody = table.querySelector("tbody");
                const row = document.createElement("tr");
                row.setAttribute("data-id", rowId);

                // Create and populate cells
                const userCell = document.createElement("td");
                userCell.textContent = usuarioActual;
                const evidenceCell = document.createElement("td");
                evidenceCell.textContent = texto;

                // Action cell
                const actionCell = document.createElement("td");
                createApproveRejectButtons(actionCell, currentSkill, row);

                row.appendChild(userCell);
                row.appendChild(evidenceCell);
                row.appendChild(actionCell);
                tbody.appendChild(row);

                // Save the initial "Unverified" status
                saveEvidenceToLocalStorage(currentSkill, row, "Unverified");

                // Clear evidenceTextarea.value
                evidenceTextarea.value = "";

            })

            // Append the button wrapper to the form
            form.appendChild(buttonWrapper);

            // Append the form to the container
            formContainer.appendChild(form);
        }

    }

    // Función que lanza la animación de confetti en toda la pantalla
    function showConfetti() {
        confetti({
            particleCount: 300,       // Número de partículas
            spread: 360,              // Dispersión completa (360 grados)
            origin: { x: 0.5, y: 0.5 }, // Origen en el centro de la pantalla (0.5, 0.5)
            colors: ['#ff0', '#0f0', '#00f', '#f00', '#0ff', '#f0f'], // Colores del confetti
            shapes: ['circle', 'square'], // Formas de las partículas
            scalar: 1.2,              // Escala de las partículas
            drift: 0.2,               // Movimiento lateral de las partículas
            gravity: 0.8,             // Gravedad que afecta las partículas
            tick: 50,                 // Velocidad de la animación
        });
    }

    const storedEvidence = JSON.parse(localStorage.getItem(currentSkill)) || [];

    // Si el skill actual ya tiene alguna evidencia subida, hacer tick a todos los checkboxes
    if (storedEvidence && storedEvidence.length > 0) {
        // Marca todas las casillas de verificación como checked
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        checkAllCompleted();
    } else {
        // Si no hay evidencia previa, añade el listener a cada checkbox
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener("change", checkAllCompleted);
        });
    }

}

window.onload = main;
