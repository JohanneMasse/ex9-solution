/*///////////////////////////////////////////////////////////////////////
                     LES VARIABLES DU QUIZ
///////////////////////////////////////////////////////////////////////*/

// Extraits audio à utiliser dans l'interface du quiz
let audio = {
    succes: new Audio('media/succes.mp3'),
    echec: new Audio('media/echec.mp3')
};

// Numéro de la question courante
let noQuestion = 0; 

// Nombre de réponses justes
let nombreReponsesJustes = 0;

// Barre d'avancement du quiz
let barreAvancement = document.querySelector(".barre-avancement");
// Largeur de la barre à tout moment (initialement 0)
let largeurBarre = 0;
// Cible de largeur pour chaque étape d'avancement du quiz (calculée selon
// progression dans les questions et nombre total de questions)
let largeurCibleBarre = 0;

// Zone d'affichage du quiz
let zoneQuiz = document.querySelector(".quiz");

// Section contenant une question du quiz et sa position sur l'axe des X
let sectionQuestion = document.querySelector("section");
let positionX = 100;

// Conteneurs des titres des questions et des choix de réponse
let titreQuestion = document.querySelector(".titre-question");
let lesChoixDeReponses = document.querySelector(".les-choix-de-reponse");

// Titre animé du quiz
let titreIntro = document.querySelector(".anim-titre-intro");

// Interface de fin de quiz
let zoneFin = document.querySelector(".fin");

// Bouton servant à recommencer le quiz
let btnRecommencer = document.querySelector('main.fin .btn-recommencer');

/*///////////////////////////////////////////////////////////////////////
                            ÉVÉNEMENTS
///////////////////////////////////////////////////////////////////////*/
// Gérer la fin de l'animation d'intro
titreIntro.addEventListener("animationend", afficherConsignePourDebuterLeJeu);

// Gérer le redémarrage du quiz dans l'écran de fin
btnRecommencer.addEventListener('click', recommencer);

/*///////////////////////////////////////////////////////////////////////
                            LES FONCTIONS
///////////////////////////////////////////////////////////////////////*/

/**
 * Afficher les consignes pour débuter le jeu
 * 
 * @param {Event} event : objet AnimationEvent de l'événement distribué 
 */
function afficherConsignePourDebuterLeJeu(event) {
    //console.log(event.animationName);
    //On affiche la consigne si c'est la fin de la deuxième animation: etirer-mot
    if (event.animationName == "etirer-mot") {
        //On affiche un message dans le pied de page
        let piedDePage = document.querySelector("footer");
        piedDePage.innerHTML = "<h1>Cliquer dans l'écran pour commencer le quiz</h1>";

        //On met un écouteur sur la fenêtre pour enlever l'intro et commencer le quiz
        window.addEventListener("click", commencerLeQuiz);
    }
}

/**
 * Enlever les éléments de l'intro et commencer le quiz
 * 
 */
function commencerLeQuiz() {
    //On enlève le conteneur de l'intro
    document.querySelector("main.intro").remove();

    //On enlève l'écouteur qui gère le début du quiz
    window.removeEventListener("click", commencerLeQuiz);

    //On met le conteneur du quiz visible
    zoneQuiz.style.display = "flex";

    //On affiche la première question
    afficherQuestion();
}


/**
 * Afficher la question courante
 * 
 */
function afficherQuestion() {
    // Récupérer l'objet de la question en cours dans le tableau des questions
    let objetQuestion = lesQuestions[noQuestion];
    
    // Affecter le texte dans le titre de la question
    titreQuestion.innerText = objetQuestion.titre;

    // Créer et afficher les balises des choix de réponse :
    // On commence par vider le conteneur des choix de réponses.
    lesChoixDeReponses.innerHTML = "";

    // Puis on le remplit de nouveau avec les choix de réponses de la question
    let unChoix;
    for (let i = 0; i < objetQuestion.choix.length; i++) {
		//On crée la balise et on y affecte une classe CSS
        unChoix = document.createElement("div");
        unChoix.classList.add("choix");
        //On intègre la valeur du choix de réponse
        unChoix.innerText = objetQuestion.choix[i];

        //On affecte dynamiquement l'index de chaque choix
        unChoix.indexChoix = i;

        //On met un écouteur pour vérifier la réponse choisie
        unChoix.addEventListener("mousedown", verifierReponse);

        //Enfin on affiche ce choix
        lesChoixDeReponses.append(unChoix);
    }

    // Modifier la valeur de la position de la section sur l'axe des X 
    // pour son animation
    positionX = 100;

    //Partir la première requête pour l'animation de la section
    requestAnimationFrame(animerSection);

    // Démarrer l'animation de la barre d'avancement
    largeurCibleBarre = (noQuestion + 1) / lesQuestions.length * 100;
    requestAnimationFrame(animerBarreAvancement);
}


/**
 * Fonction permettant d'animer l'arrivée de la section
 * 
 */
function animerSection() {
    //On décrémente la position de 2 (vw)
    positionX -= 2;
    sectionQuestion.style.transform = `translateX(${positionX}vw)`;

    //On part une autre requête  d'animation si la position n'est pas atteinte
    if (positionX > 0) {
        requestAnimationFrame(animerSection);
    }
}


/**
 * Vérifier la réponse choisie et passer à l'étape suivante
 * 
 * @param {object} event Informations sur l'événement MouseEvent distribué
 */
function verifierReponse(event) {
    // Voiler les choix de réponse pour ne pas permettre le clic sur plusieurs
    // choix de réponse
    lesChoixDeReponses.classList.toggle('desactiver');

    // Conteneur de la réponse choisie 
    let reponseChoisie = event.target;
    let indexReponseChoisie = reponseChoisie.indexChoix;
    if(lesQuestions[noQuestion].bonneReponse == indexReponseChoisie) {
        audio.succes.play();
        audio.succes.currentTime = 0;
        reponseChoisie.classList.add('reponse-succes');
        nombreReponsesJustes++;
    }
    else {
        reponseChoisie.classList.add('reponse-echec');
        audio.echec.play();
        audio.echec.currentTime = 0;
    }

    // On passe à la question suivante lorsque l'animation de la réponse choisie
    // est terminée
    reponseChoisie.addEventListener('animationend', gererProchaineQuestion);
}

/**
 * Animer la barre d'avancement
 * 
 */
 function animerBarreAvancement() {
    // Incrémenter la largeur de la barre par 1vw
    largeurBarre++;
    barreAvancement.style.width = largeurBarre + "vw";

    // Requête d'animation si la largeur cible n'est pas atteinte
    if (largeurBarre < largeurCibleBarre) {
        requestAnimationFrame(animerBarreAvancement);
    }
}

/**
 * Fonction permettant de gérer l'affichage de la prochaine question
 * 
 */
function gererProchaineQuestion(event) {
    // Dévoiler les choix de réponse pour ne pas permettre le clic sur plusieurs
    // choix de réponse
    lesChoixDeReponses.classList.toggle('desactiver');

    // On incrémente noQuestion pour la  prochaine question à afficher
    noQuestion++;

    //S'il reste une question on l'affiche, sinon c'est la fin du quiz...
    if (noQuestion < lesQuestions.length) {
        afficherQuestion();
    } else {
        afficherFinQuiz();
    }
}

/**
 * Fonction permettant d'afficher l'interface de la fin du jeu
 * 
 */
function afficherFinQuiz() {
    // On retire la zone du quiz de l'affichage
    zoneQuiz.style.display = "none";

    // On créé dynamiquement la section qui contiendra le résultat
    let sectionResultat = document.createElement('section');
    // On lui associe la classe 'resultat'
    sectionResultat.classList.add('resultat');
    // On lui ajoute le texte du résultat 
    sectionResultat.innerText = `Votre score : ${nombreReponsesJustes} / ${lesQuestions.length}`;
    
    // On insère la section dans la zone de fin de quiz, *avant* le bouton "recommencer"
    btnRecommencer.before(sectionResultat);

    // Et on remet dans l'affichage la zone de fin du quiz
    zoneFin.style.display = "flex";

    // Le bouton "recommencer" est affiché à la fin de l'animation du résultat du quiz
    sectionResultat.addEventListener('animationend', afficherBtnRecommencer);
}

/**
 * Modifier l'opacité du bouton 'recommencer' pour le rendre visible
 */
function afficherBtnRecommencer() {
    btnRecommencer.style.opacity = '1';
}

/**
 * Redémarrer le quiz (msans l'animation de début) en réinitialisant l'état de 
 * l'application.
 */
 function recommencer() {
    noQuestion = 0;
    nombreReponsesJustes = 0;
    largeurBarre = 0;
    largeurCibleBarre = 0;
    
    // Retirer du DOM la section contenant le résultat
    document.querySelector('.resultat').remove(); 
    
    // Remettre l'opacité du bouton "recommencer" à 0
    btnRecommencer.style.opacity = 0;

    //On remet le conteneur du quiz dans l'affichage
    zoneQuiz.style.display = "flex";
    
    // Et on retire l'interface de fin du quiz de l'affichage
    zoneFin.style.display = "none";
    
    // On affiche la première question.
    afficherQuestion();
}