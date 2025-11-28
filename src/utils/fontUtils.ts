export const POPULAR_GOOGLE_FONTS = [
    "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins", "Inter", "Merriweather", "Playfair Display",
    "Nunito", "Raleway", "Ubuntu", "Oswald", "Rubik", "Lora", "Work Sans", "Nunito Sans",
    "Quicksand", "Barlow", "Inconsolata", "PT Sans", "Mukta", "Titillium Web", "Muli", "Karla",
    "Josefin Sans", "Libre Baskerville", "Anton", "Bitter", "Dosis", "Cabin", "Oxygen", "Arvo",
    "Hind", "Crimson Text", "Fjalla One", "Abel", "Bebas Neue", "Dancing Script", "Pacifico",
    "Lobster", "Comfortaa", "Shadows Into Light", "Abril Fatface", "Satisfy", "Courgette",
    "Permanent Marker", "Amatic SC", "Kaushan Script", "Righteous", "Fredoka One", "Luckiest Guy",
    "Bangers", "Creepster", "Special Elite", "Monoton", "Press Start 2P", "Audiowide", "Syncopate",
    "Orbitron", "Exo 2", "Rajdhani", "Teko", "Kanit", "Prompt", "Chakra Petch", "Saira", "Varela Round"
].sort();

export const loadFont = (fontFamily: string) => {
    if (!fontFamily) return;

    const linkId = `font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
    if (document.getElementById(linkId)) {
        return; // Font already loaded
    }

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
    document.head.appendChild(link);
};
