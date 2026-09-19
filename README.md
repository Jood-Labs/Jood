<br>
<div align="center">

<img src="assets/logo-slogan.svg" alt="جُود — الجود من الموجود" width="362" />

<br />

An AI-powered platform that turns available ingredients into recipes that fit your meal preferences, helping you decide what to cook, make the most of what you have, and shop for what’s missing.


<br />

![Recipe Station](https://img.shields.io/badge/AgentX-Recipe_Station_Challenge-4F772D?style=flat-square)
![In Development](https://img.shields.io/badge/Status-Under_Development-4F772D?style=flat-square)

<br />

</div>

## 01 · Why Jood?

Having ingredients does not always mean knowing what to cook. Students and employees need meals that fit their time, and preferences, yet ingredients can remain unused until they go to waste.

In Saudi Arabia, food loss and waste stood at **27.9% in 2025**. A nationwide study published in 2021 also found that **63.6% of respondents reported wasting uncooked food during the previous four weeks**, highlighting an opportunity to help people use ingredients before they go to waste. [Saudi Press Agency](https://spa.gov.sa/en/N2410909) · [Nationwide study](https://www.mdpi.com/2304-8158/10/3/681)

<br>

## 02 · How Jood Helps

Jood addresses this gap by reducing ingredient identification, recipe selection, and shopping list assembly to a single automated pipeline, initiated from one photograph of the ingredients on hand.

- **Automated ingredient recognition.** A photograph of the fridge, shelf, or counter is processed to identify the ingredients present, which the user reviews and confirms prior to further use.
- **Preference-aware recipe generation.** Recipes are generated and validated against the confirmed ingredient set, stated dietary restrictions, and maximum preparation time, rather than retrieved from a static recipe database.
- **Waste-oriented prioritization.** Ingredients approaching expiry may be flagged, directing recipe generation to make use of them before spoilage occurs.
- **Missing-Ingredient Shopping Integration** Ingredients required by a selected recipe but absent from the confirmed set are matched against the store catalog and may be added to a shopping cart without additional user effort.

<br>

```mermaid
%%{init: {
  'theme':'base',
  'themeVariables': {
    'primaryColor':'#31572C',
    'primaryTextColor':'#FAF9F6',
    'primaryBorderColor':'#EDF49A',
    'lineColor':'#90A955',
    'textColor':'#31572C',
    'fontSize':'12px'
  }
}}%%

flowchart LR

    subgraph Input["Kitchen"]
        A["Photograph or manually<br/>add ingredients"]
    end

    subgraph Jood["Jood Pipeline"]
        B["Ingredient<br/>Identification"]
        C["Recipe Generation<br/>matched to preferences,<br/>servings, time, and<br/>expiry priority"]
        D["Missing-Ingredient<br/>Shopping Integration"]
        E["Add missing ingredients<br/>to the shopping list<br/>and place the order"]

        B --> C --> D --> E
    end

    subgraph Output["Outcome"]
        G["Meal selected,<br/>waste reduced"]
    end

    A --> B
    E --> G

    classDef stage fill:#E9F1E6,stroke:#90A955,stroke-width:1.5px,color:#31572C;
    classDef edge fill:#FAF9F6,stroke:#EDF49A,stroke-width:2px,color:#31572C;

    class B,C,D,E stage;
    class A,G edge;

    style Input fill:#30363D,stroke:#90A955,stroke-width:1.5px,color:#FFFFFF
    style Jood fill:#30363D,stroke:#90A955,stroke-width:1.5px,color:#FFFFFF
    style Output fill:#30363D,stroke:#90A955,stroke-width:1.5px,color:#FFFFFF
```

<div align="center">

<strong>Less guesswork. More from your ingredients.</strong>

<p dir="rtl">« الجُــود من الموجـود »</p>

</div>



## 03 · Features

<p align="center">
  From identifying what you have to deciding what to cook, Jood brings your ingredients, preferences, and shopping needs into one experience.
</p>

<br/>

<div align="center">

<table width="100%">

  <tr>
    <td width="50%" valign="top">
      <h3>
        <img src="https://api.iconify.design/lucide/languages.svg?color=%2390A955" width="22" height="22" alt=""/>
        &nbsp; Arabic-First Experience
      </h3>
      RTL layouts, Arabic-generated recipes, and familiar ingredient quantities for a natural cooking experience.
    </td>
    <td width="50%" valign="top">
      <h3>
        <img src="https://api.iconify.design/lucide/camera.svg?color=%2390A955" width="22" height="22" alt=""/>
        &nbsp; Ingredient Review
      </h3>
      Review detected ingredients, correct mistakes, and add or remove items before generating recipes.
    </td>
  </tr>

  <tr>
    <td width="50%" valign="top">
      <h3>
        <img src="https://api.iconify.design/lucide/star.svg?color=%2390A955" width="22" height="22" alt=""/>
        &nbsp; Use-First Priorities
      </h3>
      Prioritize ingredients you want to use first, helping make the most of what is already available.
    </td>
    <td width="50%" valign="top">
      <h3>
        <img src="https://api.iconify.design/lucide/sliders-horizontal.svg?color=%2390A955" width="22" height="22" alt=""/>
        &nbsp; Personalized Recipes
      </h3>
      Generate recipes tailored to dietary needs, allergies, dislikes, preferred cuisines, servings, and preparation time.
    </td>
  </tr>

  <tr>
    <td width="50%" valign="top">
      <h3>
        <img src="https://api.iconify.design/lucide/chef-hat.svg?color=%2390A955" width="22" height="22" alt=""/>
        &nbsp; Recipe Variety
      </h3>
      Explore three recipe suggestions with checks for repetitive combinations, offering more ways to use your ingredients.
    </td>
    <td width="50%" valign="top">
      <h3>
        <img src="https://api.iconify.design/lucide/shopping-cart.svg?color=%2390A955" width="22" height="22" alt=""/>
        &nbsp; Missing Ingredient Tracking
      </h3>
      Clearly distinguish ingredients you already have, common pantry staples, and missing items needed to complete a recipe.
    </td>
  </tr>

  <tr>
    <td width="50%" valign="top">
      <h3>
        <img src="https://api.iconify.design/lucide/bookmark.svg?color=%2390A955" width="22" height="22" alt=""/>
        &nbsp; Saved Recipes & Shopping List
      </h3>
      Save recipes for later and collect missing ingredients in one shopping list.
    </td>
    <td width="50%" valign="top">
      <h3>
        <img src="https://api.iconify.design/lucide/settings.svg?color=%2390A955" width="22" height="22" alt=""/>
        &nbsp; Account & Preferences
      </h3>
      Manage your profile and food preferences for a more consistent experience across recipe requests.
    </td>
  </tr>

</table>

</div>

<br>

## 04 · AI Pipeline

### 04.1 · Ingredient Detection

```mermaid
%%{init: {
  'theme':'base',
  'themeVariables': {
    'primaryColor':'#31572C',
    'primaryTextColor':'#FAF9F6',
    'primaryBorderColor':'#EDF49A',
    'lineColor':'#90A955',
    'textColor':'#31572C',
    'edgeLabelBackground':'#30363D',
    'fontSize':'12px'
  }
}}%%

flowchart LR

    A["Kitchen photo"] --> B["First pass<br/>DeepSeek VLM"]

    B --> C{"7 or more<br/>items returned?"}

    C -->|"no"| F["Semantic merge"]

    C -->|"yes, crowded"| D["Split into 2×2<br/>overlapping tiles"]

    D --> E["Parallel VLM call<br/>per tile"]

    E --> F

    F --> G["Ingredient list<br/>name + confidence"]

    G --> H["User confirms<br/>or corrects"]

    classDef step fill:#E9F1E6,stroke:#31572C,stroke-width:1.5px,color:#31572C;

    class A,B,C,D,E,F,G,H step;

    linkStyle default stroke:#90A955,stroke-width:1.5px;

    classDef default color:#31572C;

    %% White text for edge labels
    %% Mermaid supports edge label text styling through themeCSS,B,C,D,E,F,G,H step;
```
<br>

**Result**, on a held-out set of 22 real kitchen photos (103 ingredient labels, no confidence floor):

<div align="center">

<table>
  <tr>
    <th>Metric</th>
    <th>Evaluation Result</th>
  </tr>
  <tr>
    <td><b>Micro-Averaged F1 Score</b></td>
    <td><b>0.926</b></td>
  </tr>
  <tr>
    <td>Overall Detection Precision</td>
    <td>0.940</td>
  </tr>
  <tr>
    <td>Overall Detection Recall</td>
    <td>0.913</td>
  </tr>
  <tr>
    <td>Fully Correct Kitchen Images</td>
    <td>14 / 22</td>
  </tr>
  <tr>
    <td>Non-Food Objects Incorrectly Reported</td>
    <td>0</td>
  </tr>
  <tr>
    <td>Inference Latency</td>
    <td>18.6 s median · 50.8 s worst case</td>
  </tr>
</table>

</div>

<br>

>Full methodology and failure analysis: [`detection_benchmark/`](detection_benchmark/README.md).

### 04.2 · Recipe Generation

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#31572c', 'primaryTextColor':'#faf9f6', 'primaryBorderColor':'#edf49a', 'lineColor':'#31572c', 'textColor':'#31572c', 'fontSize':'12px'}}}%%
flowchart LR
    A["Confirmed ingredients<br/>+ priority/expiring items<br/>+ diet, servings, max time"] --> B["Prompt Construction"]
    B --> C["DeepSeek<br/>generate 3 recipes"]
    C --> D{"Validate: availability,<br/>diet, priority use,<br/>diversity, language"}
    D -->|"fails, up to 7 attempts"| E["Retry with the<br/>specific failure"]
    E --> C
    D -->|"passes"| F["Ground against<br/>real ingredient list"]
    F --> G["Recipes with<br/>you_have / you_need"]

    classDef step fill:#e9f1e6,stroke:#31572c,color:#31572c;
    class A,B,C,D,E,F,G step;
```

**Result**, on 27 functional test cases covering recipe constraints, user preferences, output consistency, and robustness:

<div align="center">

<table>
  <tr>
    <th>Metric</th>
    <th>Evaluation Result</th>
  </tr>
  <tr>
    <td><b>Overall Test Case Pass Rate</b></td>
    <td><b>100%</b></td>
  </tr>
  <tr>
    <td>Functional Test Cases Successfully Passed</td>
    <td>27 / 27</td>
  </tr>
  <tr>
    <td>User Constraint Adherence Validation</td>
    <td>Passed</td>
  </tr>
  <tr>
    <td>Output Structure & Reliability Validation</td>
    <td>Passed</td>
  </tr>
  <tr>
    <td>Recipe Generation Quality Checks</td>
    <td>Passed</td>
  </tr>
  <tr>
    <td>Robustness & Safety Validation</td>
    <td>Passed</td>
  </tr>
</table>

</div>
<br>

The recipe-generation service was validated across four main areas:

- **Constraint Adherence:** Allergies, dislikes, dietary preferences, servings, preparation time, and priority ingredients.
- **Output Reliability:** Arabic-only output, valid response schema, and no duplicate ingredients or recipe names.
- **Generation Quality Checks:** Recipe diversity and reasonable use of available ingredients.
- **Robustness & Safety:** Invalid inputs, oversized inputs, validation failures, and prompt-injection resistance.

<br>

## 05 · Tech stack

<div align="center">

<table>
  <tr>
    <th>Layer</th>
    <th>Stack</th>
  </tr>
  <tr>
    <td><b>Frontend</b></td>
    <td>React 19, Vite, React Router, Tailwind CSS 4, Lucide Icons</td>
  </tr>
  <tr>
    <td><b>Backend</b></td>
    <td>FastAPI, Pydantic, Uvicorn, python-multipart, python-dotenv</td>
  </tr>
  <tr>
    <td><b>AI</b></td>
    <td>DeepSeek (Vision + Language)</td>
  </tr>
  <tr>
    <td><b>Data & Auth</b></td>
    <td>Supabase (Postgres, Auth)</td>
  </tr>
  <tr>
    <td><b>Image Handling</b></td>
    <td>Pillow, pillow-heif (HEIC support for iPhone photo uploads)</td>
  </tr>
</table>

</div>


## 06 · System

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'background':'#4c4c4c', 'primaryColor':'#123634', 'primaryTextColor':'#faf9f6', 'primaryBorderColor':'#edf49a', 'lineColor':'#faf9f6', 'textColor':'#faf9f6', 'fontSize':'12px', 'edgeLabelBackground':'#4c4c4c'}}}%%
flowchart TD
    subgraph Client["Frontend: React"]
        A1["Auth / Landing"] --> A2["Ingredient review<br/>photo or manual"]
        A2 --> A3["Recipes, cart,<br/>account"]
    end

    subgraph API["Backend: FastAPI"]
        B1["/ingredients/detect"]
        B2["/recipes/generate"]
        B3["/shopping-list/*"]
        B4["/auth, /preferences,<br/>/profile, /bookmarks"]
    end

    subgraph External["External services"]
        C1["DeepSeek<br/>vision + language"]
        C2[("Supabase<br/>auth, profiles, recipes,<br/>products, aliases")]
    end

    A2 -->|"multipart photo"| B1
    A3 -->|"ingredients + prefs"| B2
    A3 -->|"missing items"| B3
    A1 -->|"credentials"| B4

    B1 --> C1
    B2 --> C1
    B2 --> C2
    B3 --> C2
    B4 --> C2

    style Client fill:#2a2a2a,stroke:#edf49a,color:#faf9f6
    style API fill:#2a2a2a,stroke:#31572c,color:#faf9f6
    style External fill:#2a2a2a,stroke:#006837,color:#faf9f6
```

## 07 · Project structure

```
Jood/
│
├── assets/                 Logos used in this README
│
├── backend/                FastAPI service
│   ├── models/                Pydantic request/response schemas
│   ├── routes/                auth, ingredients, recipes, shopping_list, ...
│   ├── services/              cv_service, llm_service, recipe_matching, store_service
│   └── requirements.txt       Pinned Python dependencies
│
├── detection_benchmark/    Standalone evaluation of the detection pipeline
│   └── README.md              Benchmark methodology and results
│
├── frontend/                React + Vite single-page app
│   ├── src/
│   │   ├── pages/                Landing, auth, Home, IngredientReview, Recipes, Cart, ...
│   │   └── services/             Fetch wrappers per backend route group
│   ├── .gitignore              Frontend-specific ignore rules
│   └── README.md               Frontend setup notes
│
├── .gitignore               Root-level ignore rules
└── README.md                This file
```

## 08 · Quick start

**Backend**
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1        # or source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
```

Create `backend/.env`:
```
DEEPSEEK_API_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

```bash
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

> If `backend/requirements.txt` changes, re-run `pip install -r requirements.txt` in the activated venv before starting the server again.

<br>

## 09 · The Team

<p align="center">
  <a href="https://github.com/RenadAlh">
    <img src="https://img.shields.io/badge/Renad_Alharthi-AI_Engineer-31572C?style=flat-square&labelColor=243D20" alt="Renad Alharthi — AI Engineer" />
  </a>
  <br /><br />
  <a href="https://github.com/Rawan-Alahmadi">
    <img src="https://img.shields.io/badge/Rawan_Alahmadi-AI_Engineer-31572C?style=flat-square&labelColor=243D20" alt="Rawan Alahmadi — AI Engineer" />
  </a>
  <br /><br />
  <a href="https://github.com/RanaAlsaggaf">
    <img src="https://img.shields.io/badge/Rana_Alsaggaf-UI%2FUX_Designer-31572C?style=flat-square&labelColor=243D20" alt="Rana Alsaggaf — UI/UX Designer" />
  </a>
  <br /><br />
  <a href="https://github.com/haifMohammed">
    <img src="https://img.shields.io/badge/Haif_Albarakati-Full--Stack_Developer-31572C?style=flat-square&labelColor=243D20" alt="Haif Albarakati — Full-Stack Developer" />
  </a>
</p>

---
<br>
<div align="center">

<img src="assets/logo-mark.svg" alt="Jood" width="64" />

<br />

**Built by Jood Team** for the HungerStation AgentX challenge

<p dir="rtl">« الجُــود من الموجـود »</p>

</div>
