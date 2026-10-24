# La Place Caisse — V1 locale

App de caisse hors ligne pour tablette Android (Chrome), imprimante Sewoo en USB (ESC/POS) et tiroir RJ11 branché sur le port DK.

## Fichiers
- `index.html` : toute l'app (HTML/CSS/JS, sans dépendance)
- `sw.js` : cache hors ligne
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png` : installation comme une app

## Mise en ligne (HTTPS obligatoire pour WebUSB et le mode hors ligne)
1. Netlify Drop (le plus simple) : glisser le dossier sur https://app.netlify.com/drop
   ou GitHub Pages : pousser le dossier sur un dépôt, activer Pages.
2. Sur la tablette, ouvrir l'URL dans Chrome → menu ⋮ → « Ajouter à l'écran d'accueil ».
3. Ouvrir une fois avec internet : ensuite l'app marche sans connexion.

## Première configuration
1. Brancher la Sewoo à la tablette (adaptateur OTG + câble USB-A/USB-B).
2. Réglages → « Connecter l'imprimante USB » → choisir l'imprimante → autoriser.
3. « Test ticket » puis « Test tiroir ». Si le tiroir ne bouge pas : Broche tiroir = 5.
4. Optionnel : définir un code gérant (protège réglages et annulations).
5. Si WebUSB ne marche pas : installer l'app RawBT et passer le mode d'impression sur « App RawBT ».

## Données
- Tout est stocké dans la tablette (IndexedDB). Chaque vente et service porte `synced:false`, prêt pour la future synchro Supabase.
- Réglages → « Exporter les ventes (JSON) » pour une sauvegarde.
- Attention : vider les données de Chrome efface les ventes. Exporter régulièrement.
