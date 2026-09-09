/**
 * data.js — unica fonte dati del sito.
 * Tutte le pagine leggono da qui invece di avere contenuti duplicati
 * o hardcoded nel markup.
 */
(function (global) {
  "use strict";

  const personalInfo = {
    name: "Alessandro Lamattina La Rocca",
    role: "IT Manager · System Engineer",
    home: "Genova, Italia",
    email: "lamattina_alessandro@hotmail.it",
    email2: "lamattinalessandro@gmail.com",
    phone: "+39 348 596 2997",
    cvPdf: "file/alessandro_lamattina.pdf",
    photo: "file/profilo.jpg",
    linkedin: "https://www.linkedin.com/",
    github: "https://github.com/AlessandroLamattina",
  };

  const education = [
    {
      degree: "Ex studente di Ingegneria Informatica",
      school: "Università degli studi di Genova",
      year: "2015 - 2019",
    },
  ];

  // Timeline esperienze — dalla più recente alla più vecchia.
  const experiences = [
    {
      title: "IT Manager",
      company: "E-VM E Value Management Srl",
      period: "15/05/2025 – Attualmente in occupazione",
      current: true,
      description: "Responsabile IT con delega su infrastruttura, gestionale interno e supporto ai clienti. Alcune delle mie mansioni sono:",
      tasks: [
        "Gestione, manutenzione e sviluppo dell'infrastruttura IT, con responsabilità su sistemi server e networking;",
        "Sviluppo e personalizzazione del gestionale aziendale interno basato su Odoo;",
        "Consulenza IT e supporto tecnico per clienti esterni;",
        "Gestione e coordinamento di progetti, dalla pianificazione alla realizzazione;",
        "Attività di Help Desk e supporto tecnico agli utenti;",
        "Coordinamento delle attività di sviluppo marketing e gestione dei canali social aziendali.",
      ],
      tags: ["Odoo", "Server & Networking", "Project Management", "Help Desk", "Social Media"],
    },
    {
      title: "Information Technology System Engineer",
      company: "Rulex",
      period: "02/01/2024 – 14/05/2025",
      description: "Alcune delle mie mansioni erano:",
      tasks: [
        "Gestione ciclo di vita dei PC;",
        "Gestione policy aziendali PC;",
        "Azure administrator;",
        "Sviluppatore script PowerShell;",
        "Sviluppatore script Python;",
        "Gestione policy aziendali;",
        "Rapporto diretto con gli utenti;",
        "Coordinamento di lavoro con team di altri reparti;",
        "Creazione di immagini per sistemi operativi personalizzate;",
        "Gestione ticket attraverso Jira;",
        "Intune Administrator;",
        "Assistenza su tutto il pacchetto Office.",
      ],
      tags: ["Azure", "Intune", "PowerShell", "Python", "Jira"],
    },
    {
      title: "Tecnico di supporto software/hardware",
      company: "Elmec (per Deloitte Italy spa)",
      period: "01/09/2022 – 31/12/2023",
      description: "Assunto da Elmec per lavorare come specialista del supporto tecnico per Deloitte Italy spa. Tra le mie mansioni erano presenti:",
      tasks: [
        "Manutenzione di computer;",
        "Gestione dei telefoni aziendali;",
        "Gestione software aziendali;",
        "Gestione ticket tramite ServiceNow;",
        "Creazione di piccoli tools per agevolare il lavoro;",
        "Riparazioni di PC;",
        "Assistenza rapporti con clienti;",
        "Rapporto diretto con gli utenti;",
        "Coordinamento di lavoro con team di altre funzioni.",
      ],
      tags: ["ServiceNow", "Hardware", "Client Support"],
    },
    {
      title: "Tecnico di supporto software/hardware",
      company: "Stanleybet Malta Srl",
      period: "2018 – 2022",
      description: "Alcune delle mie mansioni erano:",
      tasks: [
        "Manutenzione di computer;",
        "Gestione dei telefoni aziendali;",
        "Gestione software aziendali;",
        "Gestione ticket tramite ServiceNow;",
        "Creazione di piccoli tools per agevolare il lavoro;",
        "Riparazioni di PC;",
        "Rapporto diretto con gli utenti;",
        "Coordinamento di lavoro con team di altre funzioni.",
      ],
      tags: ["ServiceNow", "Hardware", "Client Support"],
    },
    {
      title: "Tecnico di supporto software/hardware",
      company: "Goldbet Srl",
      period: "2015 – 2018",
      description: "Alcune delle mie mansioni erano:",
      tasks: [
        "Manutenzione di computer;",
        "Gestione dei telefoni aziendali;",
        "Gestione software aziendali;",
        "Gestione ticket tramite ServiceNow;",
        "Creazione di piccoli tools per agevolare il lavoro;",
        "Riparazioni di PC;",
        "Rapporto diretto con gli utenti;",
        "Coordinamento di lavoro con team di altre funzioni.",
      ],
      tags: ["ServiceNow", "Hardware", "Client Support"],
    },
  ];

  // Competenze raggruppate per area — "icon" fa riferimento a una chiave
  // del set SVG definito in app.js (ICONS), non a un'emoji.
  const skills = [
    { name: "Server & Networking", icon: "network", note: "Infrastruttura, gestione reti aziendali" },
    { name: "Microsoft Azure", icon: "cloud", note: "Amministrazione, Entra ID" },
    { name: "Microsoft Intune", icon: "device", note: "MDM, deployment client" },
    { name: "Microsoft 365", icon: "grid", note: "Amministrazione e deployment" },
    { name: "Odoo", icon: "layers", note: "Sviluppo e personalizzazione gestionale" },
    { name: "PowerShell", icon: "terminal", note: "Automazione e scripting" },
    { name: "Python", icon: "code", note: "Tool e automazioni" },
    { name: "Jira / ServiceNow", icon: "ticket", note: "Gestione ticket e progetti" },
    { name: "Project Management", icon: "clipboard", note: "Pianificazione e coordinamento" },
  ];

  // Certificati — le immagini in file/ mostrano un'anteprima, i .pdf sono i documenti completi
  const certificates = [
    { title: "Python", issuer: "LinkedIn Learning", image: "file/python.png", pdf: "file/cert/Python linkedin.pdf" },
    { title: "C++", issuer: "Certificazione", image: "file/c++.png", pdf: null },
    { title: "DevOps", issuer: "Certificazione", image: "file/DevOps.png", pdf: null },
    { title: "Fondamenti del Project Management: Budget", issuer: "LinkedIn Learning", image: "file/Fondamenti del Project Management Budget.png", pdf: "file/cert/Fondamenti del Project Management Budget.pdf" },
    { title: "Microsoft 365 Administration", issuer: "Microsoft", image: "file/Microsoft 365 Administration.png", pdf: "file/cert/Microsoft 365 Administration.pdf" },
    { title: "Microsoft 365 Deployment", issuer: "Microsoft", image: "file/Microsoft 365 Deployment.png", pdf: "file/cert/Microsoft 365 Deployment.pdf" },
    { title: "MD-102: Endpoint Administrator Associate — Cert Prep 1: Deploy Windows Client", issuer: "Microsoft", image: "file/Microsoft 365 Endpoint Administrator Associate MD102 Cert Prep 1 Deploy Windows Client.png", pdf: "file/cert/Microsoft 365 Endpoint Administrator Associate MD102 Cert Prep 1 Deploy Windows Client.pdf" },
    { title: "AZ-900: Azure Fundamentals — Cert Prep 1", issuer: "Microsoft", image: "file/Microsoft Azure Fundamentals AZ900 Cert Prep 1.png", pdf: "file/cert/Microsoft Azure Fundamentals AZ900 Cert Prep 1.pdf" },
    { title: "AZ-900: Azure Fundamentals — Cert Prep 2", issuer: "Microsoft", image: "file/Microsoft Azure Fundamentals AZ900 Cert Prep 2.png", pdf: "file/cert/Microsoft Azure Fundamentals AZ900 Cert Prep 2.pdf" },
    { title: "Microsoft Entra ID for Administrators", issuer: "Microsoft", image: "file/Microsoft Entra ID for Administrators.png", pdf: "file/cert/Microsoft Entra ID for Administrators.pdf" },
    { title: "Microsoft Project", issuer: "Microsoft", image: "file/Microsoft Project.png", pdf: "file/cert/Microsoft Project.pdf" },
    { title: "SQL", issuer: "Certificazione", image: null, pdf: "file/cert/sql.pdf" },
  ];

  // Progetti Python
  const pythonProjects = [
    {
      title: "Tracciamento Mani",
      description: "Script di computer vision che tiene traccia delle dita aperte in tempo reale, le conta a schermo e indica quale dito è aperto. Un secondo script avvia funzioni diverse in base alla posizione della mano rilevata.",
      tags: ["Python", "OpenCV", "MediaPipe"],
      videos: [
        { src: "file/TrackerMani.mp4", label: "Conteggio dita" },
        { src: "file/CambioVoltoConMani.mp4", label: "Azione in base alla posizione" },
      ],
    },
    {
      title: "MailSender",
      description: "Invia email a due liste di persone: il primo nome della prima lista va in \"A:\", il resto in \"CC:\"; dalla seconda lista prende chi deve essere in copia conoscenza per necessità di progetto. Gestisce allegati, un'anteprima dei destinatari e un correttore ortografico integrato.",
      tags: ["Python", "Outlook COM", "Automazione"],
      link: { href: "https://github.com/AlessandroLamattina/MailGroup", label: "Progetto su GitHub" },
      videos: [{ src: "file/MailSender.mp4", label: "Demo" }],
      images: ["file/Invio.png", "file/ricezione.png"],
    },
    {
      title: "Conversione PDF → Excel",
      description: "Estrae i dati da libri giornale in PDF e li porta in Excel; la logica di conversione cambia in base alla società a cui fa riferimento il documento. In alcuni casi sfrutta il multiprocessing per analizzare più file in parallelo.",
      tags: ["Python", "pandas", "Multiprocessing"],
      videos: [{ src: "file/lgconverter.mp4", label: "Demo conversione" }],
      images: ["file/librogiornalepdf.png", "file/Risultato conversione.png"],
    },
  ];

  // Progetti Web
  const webProjects = [
    {
      title: "Fit NeXum",
      description: "Piattaforma gestionale per personal trainer e coach: unisce in un unico posto clienti, programmi di allenamento e progressi. Include una libreria esercizi filtrabile con supporto a superserie, EMOM, AMRAP e set a tempo, un sistema di abbinamento coach-cliente basato sugli obiettivi (dimagrimento, massa, riabilitazione), gestione finanziaria con fatturazione, piani di abbonamento e MRR, dashboard con aderenza/presenze e uno scheduler appuntamenti condiviso tra coach e atleti.",
      tags: ["Coaching SaaS", "Gestione clienti", "Fatturazione"],
      link: { href: "https://fit-nexum.it", label: "Visita il sito" },
    },
    {
      title: "Dungeon Dice",
      description: "Web app per il lancio dei dadi in sessioni di Dungeons & Dragons e giochi di ruolo da tavolo. Permette di creare tavoli virtuali e invitare altri giocatori tramite codice, con dadi animati, cronologia dei tiri visibile a tutti i partecipanti per garantire trasparenza, ruoli distinti per giocatore e master, e profili personaggio salvabili con il login.",
      tags: ["Tabletop RPG", "Multiplayer", "Realtime"],
      link: { href: "https://dungeondice.lovable.app", label: "Visita il sito" },
    },
    {
      title: "Quelli del Giovedì",
      description: "App per organizzare le partitelle di calcio tra amici. Gestisce login (email, Google, Apple), calendario partite, formazione e bilanciamento delle squadre, rosa dei giocatori e statistiche di gruppo per tenere traccia delle prestazioni nel tempo.",
      tags: ["Sport", "Gestione squadre", "Statistiche"],
      link: { href: "https://quellidelgiovedi.lovable.app", label: "Visita il sito" },
    },
  ];

  // Tool / automazioni
  const tools = [
    {
      title: "CV Finder",
      description: "Applicazione desktop (PyQt5) che cerca curriculum sul PC e nelle librerie SharePoint dell'utente tramite Microsoft Graph API, e scansiona le cartelle di Outlook (via COM) alla ricerca di email con CV in allegato. Esporta i risultati in Excel.",
      tags: ["Python", "PyQt5", "Microsoft Graph", "Outlook COM"],
      path: "tools/cv_finder.py",
      icon: "doc",
    },
    {
      title: "Java Version Checker",
      description: "Script PowerShell che verifica quali applicativi aziendali richiedono una versione di Java sono installati, ne confronta la versione richiesta con quella installata sul PC e propone l'aggiornamento automatico se necessario.",
      tags: ["PowerShell", "Automazione IT"],
      path: "tools/main.ps1",
      icon: "terminal",
    },
  ];

  global.CV_DATA = {
    personalInfo,
    education,
    experiences,
    skills,
    certificates,
    pythonProjects,
    webProjects,
    tools,
  };
})(window);
