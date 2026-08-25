# Git & Version Control Rules

## 1. Commit Message Convention
All commits must follow the Conventional Commits specification.
Format:
`<type>(<scope>): <short description>`

### Allowed Types:
- `feat`: A new user-facing feature or capability.
- `fix`: A bug fix.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `perf`: Performance improvement.
- `test`: Adding or correcting tests.
- `docs`: Documentation changes only.
- `chore`: Changes to build process, dependencies, or auxiliary tools.
- `ci`: Changes to CI/CD configuration.

### Commit Rules:
- Description must be in plain English or Vietnamese without emoji.
- Commit messages must be clear, imperative, and concise (e.g. `feat(billing): add mock invoice repository adapter`).

## 2. Branching Strategy
- `main`: Production-ready branch. Must always be deployable.
- `develop`: Integration branch for active features.
- `feature/<feature-name>`: Dedicated branch for specific capabilities.
- `hotfix/<fix-name>`: Immediate production bug fixes.

## 3. Atomic Commits & Clean History
- Keep commits small, atomic, and focused on a single logical change.
- Never commit broken code or failing tests to shared branches.
- Do not commit generated build files, temporary dumps, or `.env` files.
