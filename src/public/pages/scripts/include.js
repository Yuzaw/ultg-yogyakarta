function includeHTML() {
    const elements = document.querySelectorAll("[data-include]");
    elements.forEach((el) => {
        const file = el.getAttribute("data-include");
        fetch(file)
            .then((response) => response.text())
            .then((data) => {
                el.innerHTML = data;
            })
            .catch((error) => console.error("Error loading component:", error));
    });
}

document.addEventListener("DOMContentLoaded", includeHTML);
