# ATS CV Analyzer

Application web d'analyse de CV et de comparaison avec des offres d'emploi.

## Architecture

- **Frontend:** Angular avec Angular Material
- **Backend:** FastAPI avec SQLAlchemy/Alembic
- **Base de données:** PostgreSQL
- **IA locale:** Sentence Transformers
- **OCR:** Tesseract OCR

## Démarrage rapide

### Sans Docker

1. **Backend:**
   ```bash
   cd ats-cv-analyzer/backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend:**
   ```bash
   cd ats-cv-analyzer/frontend
   npm install
   ng serve
   ```

3. **Base de données:**
   - Installer PostgreSQL
   - Créer la base `ats_cv_analyzer`
   - Copier `.env.example` en `.env` et ajuster les paramètres

### Avec Docker

```bash
cd ats-cv-analyzer
docker-compose up --build
```

## API

L'API est disponible sur `http://localhost:8000/docs` (Swagger UI).

### Endpoints

- `POST /api/cvs/` - Téléverser un CV
- `GET /api/cvs/` - Lister les CVs
- `POST /api/jobs/` - Créer une offre d'emploi
- `GET /api/jobs/` - Lister les offres
- `POST /api/analyses/` - Lancer une analyse
- `GET /api/analyses/` - Lister les analyses

## Développement

### Structure du projet

```
ats-cv-analyzer/
├── frontend/          # Angular
├── backend/           # FastAPI
├── data/              # Données de compétences
└── docker-compose.yml
```

### Commandes utiles

- Backend: `uvicorn app.main:app --reload`
- Frontend: `ng serve`
- Tests: `ng test` (frontend), `pytest` (backend)
- Build: `ng build` (frontend), `docker-compose build`

## Fonctionnalités

### Core
- [x] Upload PDF/DOCX
- [x] Extraction de texte (pypdf, python-docx)
- [x] OCR pour documents scannés (Tesseract)
- [ ] Détection des sections du CV
- [x] Extraction des compétences (~250 skills tech)
- [x] Analyse de l'offre d'emploi
- [x] Matching multi-niveaux (exact → synonymes → lié → partiel)
- [x] Analyse sémantique (TF-IDF + cosine similarity)
- [x] Système de scoring (skills 50% + exp 20% + formation 10% + ATS 20%)

### Interface
- [x] Interface de résultats (score, skills, recommandations)
- [x] Éditeur riche (contenteditable, formatage préservé au collage)
- [x] Informations personnelles extraites (nom, email, tel, LinkedIn, GitHub...)
- [x] Badges colorés par type de match (exact/synonyme/lié/partiel/sémantique)
- [x] Vérifications ATS (email, téléphone, sections, texte extractible)
- [x] Modèles d'offres prédéfinis (Support IT, Dev, DevOps, Data)

### DevOps
- [x] Launchers (launch.sh, launch_frontend.sh, launch_backend.sh)
- [x] VS Code launch.json (Angular + FastAPI)
- [x] Docker Compose (Angular, FastAPI, PostgreSQL)