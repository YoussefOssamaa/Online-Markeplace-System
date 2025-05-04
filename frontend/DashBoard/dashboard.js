document.addEventListener("DOMContentLoaded", () => {
    const propCards = document.querySelectorAll('.prop');

    propCards.forEach((card) => {
        card.style.cursor = "pointer";

        card.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior

            const linkElement = card.querySelector('a.setting-box');
            if (linkElement && linkElement.href) {
                window.open(linkElement.href, '_blank'); // Open in new tab
            }
        });
    });
});
