✅ BUG: quand on créé une forme elle est selectionnée par défaut. Cela fonctionne mais il faudrait que l'outil selection soit également activé afin de pouvoir immédiatement déplacer l'objet
✅ BUG: quand on double click sur une forme pour ajouter du texte, le curseur devrait directement être visible
✅ EVOLUTION: la police par défaut devrait être excalifont
✅ BUG: l'outil import d'image ne fonctionne pas. il faut supporter un maximum de format d'image
- FEATURE: il faut ajouter un outil d'import de diagram compatible avec le format excalidraw et le format drawio. 
✅ BUG: l'outil gomme ne fonctionne pas
✅ BUG: la propriété angle ne fonctionne pas
- FEATURE: il manque des outils d'alignement sur selection multiples comme dans excalidraw. Pour le design voir l'image alignement dans design_examples. alignement horizontal (a gauche a droite centré répartit horizontalement) et alignement vertical (en haut en bas au centre repartit verticalement)
✅ EVOLUTION: harmoniser la taille des icones de fenêtre de propriétés. Boutons carrés tous de la même taille.
✅ BUG: l'onglet affiche VITE + REACT + TS en titre. Change cela pour le nom de l'application
✅ BUG: en mode édition de texte les touches SUPR et BACKSPACE ne doivent pas supprimer la forme. Dans ce contexte ces touches servent a supprimer du texte édité. 
✅ BUG: en mode édition de texte, entrée rajoute un espace (ou autre chose mais ça ressemble a un espace).
✅ EVOLUTION: en mode édition de texte SHIFT+ENTER provoque un retour a la ligne. 
✅ BUG: les images importée ne peux pas être redimensionnée ou rotatée 
✅ BUG: les lignes et les flèche ont un comportement étrange. déjà le bout de la ligne fleche n'est pas collée au curseur. Les déplacement sont étrange par exemple au premier click le dessin de la flèche par directement vers le bas a gauche. 
✅ BUG: les images comme les autres formes devrait avoir un rectangle visuel autour de celles ci. 
✅ FEATURE: on doit pouvoir copier une image d'un autre onglet et la coller dans l'application.
✅ BUG: en mode édition de texte les racourcis clavier ne devraient pas être activés. 
✅ FEATURE: ajouter une propriété arrondi pour les formes elle permet d'avoir des angles arrondis ou droit selon si elle est activée ou non. 
✅ BUG: quand je redimensionne un ensemble de forme, cela est beaucoup trop sensible donc inutilisable. 
✅ BUG: en redimensionnement d'image ayant subit une rotation, le resize est symétrique, ce ne devrait pas être le cas.
✅ BUG: en mode coin arrondi on perd le rendu de rough.js
✅ EVOLUTION: il y a un bandeau sous la barre d'outil. Il ne devrais pas exister. Cela empiète sur la surface de travail. 
✅ FEATURE: lorsque l'on redimensionne un objet en maintenant la touche CTRL enfoncée, le redimensionnement est proportionnel. 
✅ BUG: quand on passe sur un controle de redimensionnement l'icone du curseur devrait être différente. genre une double flèche inclinée. cela montrerais que l'on est bien sur l'ancre de redimensionnement. 
✅ CLEANUP: enleve les références a roboto pour les fontes. Dans le code et dans le visuel de l'interface. 
✅ BUG: quand j'ai copié et collé une image, je ne peux plus rien copier coller d'autre, ça me colle systématiquement l'image.
✅ CLEANUP: desactive les logs (tous) qui apparaissent dans la console
✅ BUG: en mode selection multiple, quand on passe sur les ancres de redimensionement bas gauche et haut droit, l'icone de curseur n'est pas la double fleche inclinée
✅ FEATURE: en mode edition de texte, la touche debut amène en début de texte, la touche fin en fin de texte, SHIFT+fleche gauche / fleche droite permet de selectionner le text, CTRL+A permet de selectionner tout le texte
- EVOLUTION: en mode rotation il est inutile d'avoir le rectangle de selection. Celui ci réapparait en fin de rotation
- BUG: il manque pour le texte des formes les alignements vérticaux (haut bas milieu)
✅ FEATURE: en mode selection de texte (SHIFT+FLECHE) il faut un repère visuel comme un fond bleu indiquant la selection en cours
✅ BUG: en mode edition de texte l'utilisation de fleche haut/bas permet de remonter les différentes ligne. Cela est aussi valable en mode selection.
✅ BUG: aprés une suppression en mode selection multiligne, le curseur clignotant n'apparait plus. 
✅ BUG: le retour a la ligne automatique ne se fait plus en édition de texte de forme. 
- BUG: quand je fais une suppression de plusieurs ligne, je vois le le texte complet apparaitre deux fois
✅ FEATURE: implémenter les racourcis CTRL+X CTRL+C CTRL+V avec la selection de texte dans les formes
✅ FEATURE: CTRL+flèche gauche droite doit permettre de naviguer par mot dans l'édition de texte.
✅ FEATURE: CTRL+SHIFT+fléche gauche ou droite doit permettre de selectionner par mot dans l'édition de texte 
- BUG: un click en dehors de la forme, stoppe l'édition de texte. 
- REGRESSION: quand je fais une suppression dans un long texte sur une selection, le texte qui devait être supprimé apparait deux fois
- REGRESSION: quand je fais une navigation par mot. le curseur doit se positionner au début des mots. 