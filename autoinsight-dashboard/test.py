import os

# Base directory for the project
base_dir = "./"

# Directory structure
dirs = [
    "public",
    "src/assets/icons",
    "src/assets/illustrations",
    "src/components/buttons",
    "src/components/cards",
    "src/components/modals",
    "src/components/tables",
    "src/pages",
    "src/services",
    "src/hooks",
    "src/context",
    "src/utils",
    "src/theme",
]

# Placeholder files
files = {
    "public/favicon.ico": "",
    "public/robots.txt": "",
    "public/index.html": "<!-- HTML entry point -->",
    "src/App.jsx": "// Main App component",
    "src/main.jsx": "// ReactDOM render entry",
    "src/index.css": "/* Global CSS */",
    "src/theme/colors.js": "// Theme colors",
    "src/theme/global.css": "/* Global styles */",
    "src/utils/logger.js": "// Logger utility",
    ".env": "# Environment variables",
    ".gitignore": "node_modules/\ndist/\n.env\n",
    "package.json": "{\n  \"name\": \"autoinsight-dashboard\"\n}",
    "tailwind.config.js": "// Tailwind config",
    "postcss.config.js": "// PostCSS config",
    "vite.config.js": "// Vite config",
    "Dockerfile": "# Dockerfile placeholder",
    "docker-compose.yml": "# Docker Compose placeholder",
    "README.md": "# AutoInsight Dashboard",
}

def create_dirs(base, dir_list):
    for d in dir_list:
        path = os.path.join(base, d)
        os.makedirs(path, exist_ok=True)
        print(f"Created directory: {path}")

def create_files(base, file_dict):
    for f, content in file_dict.items():
        path = os.path.join(base, f)
        with open(path, "w") as file:
            file.write(content)
        print(f"Created file: {path}")

if __name__ == "__main__":
    create_dirs(base_dir, dirs)
    create_files(base_dir, files)
    print("\n✅ AutoInsight Dashboard directory structure created successfully!")
