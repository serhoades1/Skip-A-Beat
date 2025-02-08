import { connectGarmin } from './bluetooth.js';

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("connectGarmin").addEventListener("click", () => {
        connectGarmin()
            .then(() => {
                document.getElementById("startMusic").disabled = false;
            })
            .catch(err => console.error("Garmin Connection Failed:", err));
    });
});
