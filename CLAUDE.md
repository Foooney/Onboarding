# CLAUDE.md — SI Onboarding Hub

Conventions figées pour ce projet. Toute déviation doit être justifiée et reportée ici.

## Stack

Vite + React + TypeScript (strict) + Tailwind CSS + react-router-dom + lucide-react + recharts.
Persistance : `localStorage` uniquement, aucune API, aucune auth réelle. Zéro `any`, zéro erreur
`tsc --noEmit`, zéro warning console.

UI en anglais (l'application cible des équipes internationales Siemens SI). Commentaires de code
en anglais, minimaux (uniquement pour expliquer un "pourquoi" non évident).

## Design tokens

### Couleurs (`tailwind.config.ts` → `theme.extend.colors`)

```
primary  (petrol/teal — couleur de marque, CTA, liens, éléments actifs)
  50  #EDFAFA   100 #D2F1F1   200 #A8E2E1   300 #74CBCA   400 #3FADAC
  500 #1D8C8B (base)          600 #146F6F   700 #10595A   800 #0D4546   900 #0A3435

ink  (texte — bleu nuit / anthracite, jamais de noir pur)
  50  #F4F6F8   100 #E4E8EC   200 #C9D1D9   300 #A3AFBC   400 #77879A
  500 #56677C   600 #3F4E61   700 #2E3B4B (texte principal)   800 #212B38   900 #161D26

surface  (fonds et bordures)
  0   #FFFFFF (fond de page/carte)
  50  #F8F9FA (fond de page alterné / sidebar)
  100 #F1F3F5 (fond de survol, zébrage tableau)
  200 #E7EAED (bordures de carte, séparateurs)

success  (statut "completed")   500 #1C9A5B   50 #EAFBF1
warning  (alertes, "at risk")   500 #E08A1E   50 #FFF6E8
danger   (retards, "overdue")   500 #C4432E   50 #FDEDEA   — toujours discret, jamais en aplat large
```

Pas de dégradés visibles. Pas de couleur en dehors de cette palette. Les couleurs sémantiques
(success/warning/danger) sont réservées aux badges, indicateurs et icônes de statut — jamais
comme couleur de marque.

### Typographie

Police : `Inter`, fallback `system-ui, Arial, sans-serif`. Échelle explicite (classes utilitaires
Tailwind à composer, ne pas inventer de taille hors échelle) :

| Rôle       | Taille / interligne | Graisse | Usage                          |
|------------|----------------------|---------|---------------------------------|
| display    | 32px / 40px          | 600     | Titre de page principal         |
| h1         | 28px / 36px          | 600     | Titre de section majeure        |
| h2         | 22px / 28px          | 600     | Titre de carte / bloc           |
| h3         | 18px / 26px          | 600     | Sous-titre                      |
| body-lg    | 16px / 24px          | 400     | Texte mis en avant               |
| body       | 14px / 20px          | 400     | Texte courant (défaut)          |
| body-sm    | 13px / 18px          | 400     | Texte secondaire, méta          |
| label      | 13px / 18px          | 500     | Libellés de champ, colonnes     |
| caption    | 12px / 16px          | 500     | Overline, badges, timestamps    |

### Espacement, rayons, ombres

- Rayons : `rounded-lg` (8px) pour boutons/inputs, `rounded-xl` (12px) pour cartes. Jamais `rounded-full`
  sauf avatars et badges de statut ponctuels.
- Ombres : `shadow-sm` uniquement (`0 1px 2px rgba(16, 24, 32, 0.06)`). Pas d'ombre portée marquée.
- Grille : espacements en multiples de 4px (Tailwind par défaut). Cartes : padding `p-6`, gap entre
  cartes `gap-6` (desktop), `gap-4` (tablette).

### Couleurs d'avatar — la seule exception documentée

Les 6 familles ci-dessus ne suffisent pas à distinguer visuellement une vingtaine de personnes.
`src/lib/utils.ts` expose donc une palette dédiée, réservée exclusivement à `Avatar`/`AvatarGroup`,
jamais utilisée pour un statut, une action ou un élément de marque :

```
teal → bg-primary-100/text-primary-700   blue → bg-sky-100/text-sky-700
indigo → bg-indigo-100/text-indigo-700   violet → bg-violet-100/text-violet-700
pink → bg-pink-100/text-pink-700         amber → bg-amber-100/text-amber-700
green → bg-emerald-100/text-emerald-700  slate → bg-slate-200/text-slate-700
```

Le token vient de `Person.avatarColor` dans les données ; ne pas en introduire d'autres sans
mettre à jour cette liste et `AVATAR_COLOR_CLASSES`.

### Icônes

`lucide-react` exclusivement. Taille 16 ou 18px en ligne de texte, 20px en action isolée.
`strokeWidth={1.75}`. Couleur héritée du texte (`currentColor`), sauf icônes de statut qui reprennent
la couleur sémantique correspondante.

## Règles de nommage

- Composants : `PascalCase.tsx`, un composant par fichier, **export nommé** (pas de `export default`,
  sauf `App.tsx` et les composants de page consommés par le routeur si nécessaire).
- Props : interface `<ComponentName>Props` déclarée juste au-dessus du composant.
- Hooks : `camelCase`, préfixe `use`, exposés depuis `src/lib/store.tsx`.
- Fichiers utilitaires / data : `camelCase.ts`.
- Types et interfaces : `PascalCase`, tous centralisés dans `src/types/index.ts` — aucune redéfinition
  locale d'un statut, d'une priorité ou d'une phase ailleurs dans le code.
- Dossiers de pages à onglets ou wizard multi-étapes : `kebab-case/` (ex. `journey-detail/`,
  `create-journey/`).

## Structure d'un composant

```tsx
import type { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={`rounded-xl border border-surface-200 bg-white p-6 shadow-sm ${className ?? ''}`}>
      {children}
    </div>
  );
}
```

Ordre dans un fichier : imports → types/props → composant → (sous-composants privés éventuels,
non exportés). Pas de logique métier dans un composant `ui/` — uniquement des primitives
présentationnelles pilotées par props.

## Règle d'état — la plus importante

**Toute donnée métier (journeys, tasks, people, templates, l'utilisateur courant, le rôle de
visualisation) transite exclusivement par le store (`src/lib/store.tsx`).**

- Interdiction de dupliquer une liste de `journeys` ou de `tasks` dans un `useState` local d'une page.
- `useState` local est réservé à l'état d'interface éphémère qui ne doit pas survivre à la navigation :
  ouverture d'un menu/modale, valeur brouillon d'un champ, étape courante d'un wizard, tri/filtre
  d'une vue avant validation.
- Toute mutation passe par une action typée du store (`updateTask`, `setTaskStatus`, ...), jamais par
  une mutation directe de l'objet lu depuis le contexte.
- Rien n'est stocké deux fois : les valeurs dérivées (progression, compteurs, retards, agrégats)
  vivent uniquement dans `src/lib/selectors.ts` et sont recalculées à la lecture.
- Le statut `overdue` n'est jamais écrit en dur dans les données : il est dérivé à la lecture par
  `src/lib/status.ts` à partir de la date du jour, pour que la démo reste cohérente à toute date
  d'ouverture.

## Persistance

Clé `localStorage` versionnée : `si_onboarding_hub_v1`. Hydratation depuis le seed (`src/data`) si la
clé est absente ou invalide (`try/catch` systématique autour de la lecture/écriture). Action
`resetDemoData()` exposée dans la topbar, qui réécrit le seed et réinitialise le contexte.

## Accessibilité et responsive

- Cibles tactiles/clic ≥ 32px. Contraste texte/fond conforme AA sur la palette ci-dessus.
- Modales et dropdowns fermables au clavier (`Escape`) et cliquables hors zone.
- Rendu validé à 1440px, 1280px et 1024px. En dessous de 1024px, dégradation gracieuse acceptée
  (application non pensée mobile).
