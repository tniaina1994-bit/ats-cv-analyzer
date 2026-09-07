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

- [x] Upload PDF/DOCX
- [x] Extraction de texte
- [ ] OCR pour documents scannés
- [ ] Détection des sections du CV
- [ ] Extraction des compétences
- [ ] Analyse de l'offre d'emploi
- [ ] Matching multi-niveaux
- [ ] Analyse sémantique
- [ ] Système de scoring
- [ ] Interface de résultats